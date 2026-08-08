import { useState, useEffect, useRef } from "react";
import { THEMES, ROLES } from "../models/constants";
import { supabase } from "../models/supabase";
import { fetchUserProfile, TRANG_THAI } from "../models/userProfile";
import { CHUOI_RONG, fetchStreaks, updateLoginStreak } from "../models/chuoiData";
import { fetchSettings, saveSettings } from "../services/settingsService";

export function useApp() {
  const [view, setView] = useState("dashboard");
  const [query, setQuery] = useState("");
  const [theme, setTheme] = useState("glass");
  const [lang, setLang] = useState("vi");
  const [chatOpen, setChatOpen] = useState(false);
  const [fontSize, setFontSize] = useState(16);
  const [authed, setAuthed] = useState(false);
  const [role, setRole] = useState(ROLES.USER);
  const [currentEmail, setCurrentEmail] = useState("");
  const [currentProfile, setCurrentProfile] = useState(null);
  const [userId, setUserId] = useState(null);
  const [showLogout, setShowLogout] = useState(false);
  // false cho tới khi biết chắc có session hay không, để không nháy màn
  // đăng nhập trong lúc Supabase khôi phục session từ localStorage.
  const [ready, setReady] = useState(false);
  const [passwordRecovery, setPasswordRecovery] = useState(false);
  const [streak, setStreak] = useState(CHUOI_RONG);
  // Đã áp dụng một phiên đăng nhập vào app hay chưa (để không reset trang khi
  // nhận thêm sự kiện SIGNED_IN của cùng một phiên).
  const daVaoApp = useRef(false);

  useEffect(() => {
    document.documentElement.style.fontSize = fontSize + "px";
  }, [fontSize]);

  useEffect(() => {
    if (!userId) return;
    fetchSettings().then((settings) => {
      setTheme(settings.theme);
      setLang(settings.language);
      setFontSize(settings.fontSize);
    }).catch(() => {});
  }, [userId]);

  useEffect(() => {
    if (!userId) return;
    const timer = setTimeout(() => {
      saveSettings({ theme, language: lang, fontSize }).catch(() => {});
    }, 400);
    return () => clearTimeout(timer);
  }, [userId, theme, lang, fontSize]);

  // Khôi phục phiên khi tải lại trang và theo dõi đăng nhập/đăng xuất.
  useEffect(() => {
    let huy = false;

    function dangXuat() {
      daVaoApp.current = false;
      setAuthed(false);
      setRole(ROLES.USER);
      setCurrentEmail("");
      setCurrentProfile(null);
      setUserId(null);
      setStreak(CHUOI_RONG);
      setView("dashboard");
    }

    async function apDungSession(session, event) {
      if (event === "PASSWORD_RECOVERY" && session) {
        setPasswordRecovery(true);
        setAuthed(false);
        setReady(true);
        return;
      }

      if (!session) {
        dangXuat();
        setReady(true);
        return;
      }

      let profile;
      try {
        profile = await fetchUserProfile(session.user.id);
      } catch {
        // Không đọc được hồ sơ (mất mạng, RLS, hồ sơ bị xoá) thì coi như
        // chưa đăng nhập còn hơn cho vào app với role đoán mò.
        await supabase.auth.signOut();
        if (huy) return;
        dangXuat();
        setReady(true);
        return;
      }
      if (huy) return;

      // Admin có thể khoá tài khoản khi phiên đang mở.
      if (profile.status === TRANG_THAI.DA_KHOA) {
        await supabase.auth.signOut();
        if (huy) return;
        dangXuat();
        setReady(true);
        return;
      }

      setCurrentEmail(profile.email ?? session.user.email);
      setCurrentProfile(profile);
      setUserId(session.user.id);
      setRole(profile.role);
      setAuthed(true);
      // Chỉ đặt lại trang khi vừa từ ngoài vào app. SIGNED_IN còn phát ra ở
      // những lúc khác (vd đăng nhập lại để xác minh mật khẩu khi đổi mật
      // khẩu), lúc đó không được đá user về dashboard.
      if (!daVaoApp.current) {
        daVaoApp.current = true;
        setView(profile.role === ROLES.ADMIN ? "admin-users" : "dashboard");
      }
      setReady(true);

      // RPC Lab 3 tự bảo vệ việc gọi nhiều lần trong cùng ngày, nên có thể gọi lại
      // khi Supabase khôi phục phiên mà không làm tăng sai chuỗi đăng nhập.
      try {
        await updateLoginStreak();
        if (!huy) setStreak(await fetchStreaks(session.user.id));
      } catch {
        // Không lấy được chuỗi thì giữ số 0, không chặn việc dùng app.
      }
    }

    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      // Không gọi API Supabase khác ngay trong callback này (dễ deadlock),
      // đẩy sang macrotask kế tiếp.
      setTimeout(() => {
        if (!huy) apDungSession(session, event);
      }, 0);
    });

    return () => {
      huy = true;
      sub.subscription.unsubscribe();
    };
  }, []);

  const currentTheme = THEMES.find((th) => th.id === theme) ?? THEMES[0];
  const currentThemeIndex = THEMES.findIndex((th) => th.id === currentTheme.id);
  const nextTheme = THEMES[(currentThemeIndex + 1) % THEMES.length];

  function onSearch(value) {
    setQuery(value);
  }

  function toggleLang() {
    setLang((l) => (l === "vi" ? "en" : "vi"));
  }

  async function logout() {
    setShowLogout(false);
    // onAuthStateChange dọn state khi nhận SIGNED_OUT. Nếu signOut lỗi
    // (mất mạng) thì vẫn phải đưa user ra khỏi app, không kẹt lại bên trong.
    const { error } = await supabase.auth.signOut();
    if (error) {
      setAuthed(false);
      setRole(ROLES.USER);
      setCurrentEmail("");
      setCurrentProfile(null);
      setView("dashboard");
    }
  }

  // Tải lại cả hai chuỗi mà không cần tải lại trang.
  async function reloadStreak() {
    if (!userId) return;
    try {
      setStreak(await fetchStreaks(userId));
    } catch {
      // Bỏ qua: giữ số đang hiển thị.
    }
  }

  function completeAuth(email, userRole) {
    setPasswordRecovery(false);
    setRole(userRole);
    setCurrentEmail(email);
    setCurrentProfile((profile) => ({ ...profile, email }));
    setAuthed(true);
    setView(userRole === ROLES.ADMIN ? "admin-users" : "dashboard");
  }

  return {
    view,
    setView,
    query,
    setQuery,
    theme,
    setTheme,
    lang,
    setLang,
    chatOpen,
    setChatOpen,
    fontSize,
    setFontSize,
    authed,
    setAuthed,
    ready,
    passwordRecovery,
    finishPasswordRecovery: () => setPasswordRecovery(false),
    userId,
    streak,
    reloadStreak,
    role,
    setRole,
    currentEmail,
    currentProfile,
    setCurrentProfile,
    completeAuth,
    showLogout,
    setShowLogout,
    currentTheme,
    nextTheme,
    onSearch,
    toggleLang,
    logout,
  };
}
