import { useEffect, useState } from "react";
import { AUTH_TEXT, AUTH_THEMES } from "../models/authData";
import { supabase } from "../models/supabase";
import {
  fetchUserProfile,
  isValidPhone,
  normalizePhone,
  toSignUpMetadata,
  TRANG_THAI,
} from "../models/userProfile";

// Đổi thông báo lỗi tiếng Anh của Supabase sang chuỗi đã dịch trong AUTH_TEXT.
// Lỗi không nhận ra thì trả nguyên văn để còn debug được.
function translateAuthError(err, tr) {
  const msg = (err?.message || "").toLowerCase();
  if (msg.includes("invalid login credentials")) return tr.errInvalidCreds;
  if (msg.includes("already registered") || msg.includes("already been registered"))
    return tr.errEmailTaken;
  if (msg.includes("email not confirmed")) return tr.errNotConfirmed;
  if (msg.includes("rate limit") || msg.includes("too many"))
    return tr.errTooMany;
  if (msg.includes("failed to fetch") || msg.includes("network"))
    return tr.errNetwork;
  // updateUser khi đặt lại mật khẩu trùng mật khẩu cũ.
  if (msg.includes("should be different") || msg.includes("same_password"))
    return tr.errSamePassword;
  if (msg.includes("auth session missing") || msg.includes("session_not_found"))
    return tr.errResetExpired;
  // Trigger tao_ho_so_nguoi_dung ném lỗi -> Supabase trả về "Database error
  // saving new user", không nói rõ ràng buộc nào. Đoán theo unique index.
  if (msg.includes("ten_dang_nhap") || msg.includes("username"))
    return tr.errUsernameTaken;
  if (msg.includes("database error saving new user"))
    return tr.errUsernameTaken;
  return err?.message || tr.errNetwork;
}

function passwordResetRedirectUrl() {
  const configured = import.meta.env.VITE_APP_URL?.trim();
  if (!configured) return window.location.origin;

  try {
    const url = new URL(configured);
    const configuredIsLocal = ["localhost", "127.0.0.1"].includes(url.hostname);
    const currentIsLocal = ["localhost", "127.0.0.1"].includes(window.location.hostname);

    // Không để một biến môi trường cũ kéo bản production quay về localhost.
    if (configuredIsLocal && !currentIsLocal) return window.location.origin;
    return url.origin;
  } catch {
    return window.location.origin;
  }
}

function recoveryErrorFromUrl(tr) {
  const params = new URLSearchParams(window.location.hash.replace(/^#/, ""));
  const code = params.get("error_code");
  if (!code) return "";
  if (code === "otp_expired" || code === "access_denied") return tr.errResetExpired;
  return params.get("error_description")?.replaceAll("+", " ") || tr.errResetExpired;
}

// Controller: màn hình đăng nhập/đăng ký/quên mật khẩu.
// Quản lý form, chế độ (login|register|forgot), kiểm tra hợp lệ và theme/ngôn ngữ.
export function useAuth({
  onAuthed,
  passwordRecovery = false,
  onPasswordRecoveryDone,
  theme: themeProp,
  setTheme: setThemeProp,
  lang: langProp,
  setLang: setLangProp,
}) {
  const [themeLocal, setThemeLocal] = useState("glass");
  const [langLocal, setLangLocal] = useState("vi");
  const theme = themeProp ?? themeLocal;
  const setTheme = setThemeProp ?? setThemeLocal;
  const lang = langProp ?? langLocal;
  const setLang = setLangProp ?? setLangLocal;
  const tr = AUTH_TEXT[lang];

  const currentTheme =
    AUTH_THEMES.find((t) => t.id === theme) ?? AUTH_THEMES[0];
  const currentThemeIndex = AUTH_THEMES.findIndex(
    (t) => t.id === currentTheme.id,
  );
  const nextTheme = AUTH_THEMES[(currentThemeIndex + 1) % AUTH_THEMES.length];

  // Không khởi tạo mode = passwordRecovery: giá trị khởi tạo của useState chỉ
  // đọc một lần, mà cờ này có thể bật lên SAU khi Auth đã mount (thứ tự sự
  // kiện của supabase-js không đảm bảo). Suy ra mode thay vì lưu, để cờ bật
  // lúc nào cũng vào đúng màn đặt lại mật khẩu.
  const recoveryUrlError = recoveryErrorFromUrl(tr);
  const [modeLocal, setMode] = useState(() => recoveryUrlError ? "forgot" : "login");
  const mode = passwordRecovery ? "reset" : modeLocal;
  const [error, setError] = useState(recoveryUrlError);
  const [info, setInfo] = useState("");
  const [loading, setLoading] = useState(false); // chặn bấm nút 2 lần khi đang gọi API
  const [form, setForm] = useState({
    name: "",
    username: "",
    email: "",
    phone: "",
    password: "",
    confirm: "",
  });

  const upd = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));
  const isLogin = mode === "login";
  const isForgot = mode === "forgot";
  const isReset = mode === "reset";

  useEffect(() => {
    if (!recoveryUrlError) return;
    window.history.replaceState(null, "", `${window.location.pathname}${window.location.search}`);
  }, [recoveryUrlError]);

  function switchMode(m) {
    setMode(m);
    setError("");
    setInfo("");
  }

  async function submit() {
    if (loading) return;
    setError("");
    setInfo("");

    if (isLogin) {
      if (!form.email || !form.password) return setError(tr.errLogin);

      setLoading(true);
      try {
        const { data, error: err } = await supabase.auth.signInWithPassword({
          email: form.email,
          password: form.password,
        });
        if (err) return setError(translateAuthError(err, tr));

        // Role thật nằm ở nguoi_dung.ma_vai_tro, Supabase Auth không giữ role.
        let profile;
        try {
          profile = await fetchUserProfile(data.user.id);
        } catch {
          await supabase.auth.signOut();
          return setError(tr.errProfile);
        }

        // Tài khoản DA_KHOA vẫn đăng nhập được ở tầng Auth, RLS mới chặn ghi.
        // Chặn luôn ở đây để không vào được app.
        if (profile.status === TRANG_THAI.DA_KHOA) {
          await supabase.auth.signOut();
          return setError(tr.errLocked);
        }

        if (onAuthed) onAuthed({ ...form, ...profile }, profile.role);
      } finally {
        setLoading(false);
      }
      return;
    }

    // Đăng ký: giữ nguyên các ràng buộc phía client trước khi gọi API.
    if (
      !form.name ||
      !form.username ||
      !form.email ||
      !form.phone ||
      !form.password
    )
      return setError(tr.errFill);
    const passwordIsStrong =
      form.password.length >= 8 &&
      /[A-Z]/.test(form.password) &&
      /[a-z]/.test(form.password) &&
      /\d/.test(form.password) &&
      /[^A-Za-z0-9]/.test(form.password);
    if (!passwordIsStrong) return setError(tr.errLen);
    if (form.password !== form.confirm) return setError(tr.errMatch);
    // Kiểm tra trước vì DB có check '^\+?[0-9]{9,15}$' trên so_dien_thoai;
    // vi phạm sẽ làm trigger tạo hồ sơ hỏng và signUp trả lỗi khó hiểu.
    if (!isValidPhone(form.phone)) return setError(tr.errPhone);

    setLoading(true);
    try {
      const { data, error: err } = await supabase.auth.signUp({
        email: form.email,
        password: form.password,
        // Vào raw_user_meta_data của auth.users — trigger tao_ho_so_nguoi_dung
        // đọc đúng các khoá ho_ten / ten_dang_nhap / so_dien_thoai.
        options: {
          data: toSignUpMetadata({
            name: form.name.trim(),
            username: form.username.trim(),
            phone: normalizePhone(form.phone),
          }),
        },
      });
      if (err) return setError(translateAuthError(err, tr));

      // Bật "Confirm email" trên dashboard: chưa có session, phải xác nhận mail.
      if (!data.session) {
        switchMode("login"); // gọi trước vì switchMode xoá error/info
        setInfo(tr.errNotConfirmed);
        return;
      }
      // Vừa đăng ký nên chắc chắn là USER, nhưng vẫn đọc hồ sơ để lấy đúng
      // dữ liệu do trigger sinh ra (ho_ten, ten_dang_nhap...).
      let profile;
      try {
        profile = await fetchUserProfile(data.user.id);
      } catch {
        await supabase.auth.signOut();
        return setError(tr.errProfile);
      }
      if (onAuthed) onAuthed({ ...form, ...profile }, profile.role);
    } finally {
      setLoading(false);
    }
  }

  async function submitForgot() {
    if (loading) return;
    setError("");
    setInfo("");
    if (!form.email) return setError(tr.errEmailOnly);

    setLoading(true);
    try {
      const { error: err } = await supabase.auth.resetPasswordForEmail(
        form.email,
        { redirectTo: passwordResetRedirectUrl() },
      );
      if (err) return setError(translateAuthError(err, tr));
      setInfo(tr.resetSent);
    } finally {
      setLoading(false);
    }
  }

  async function submitReset() {
    if (loading) return;
    setError("");
    setInfo("");
    if (!form.password || !form.confirm) return setError(tr.errResetFill);

    const passwordIsStrong =
      form.password.length >= 8 &&
      /[A-Z]/.test(form.password) &&
      /[a-z]/.test(form.password) &&
      /\d/.test(form.password) &&
      /[^A-Za-z0-9]/.test(form.password);
    if (!passwordIsStrong) return setError(tr.errLen);
    if (form.password !== form.confirm) return setError(tr.errMatch);

    setLoading(true);
    try {
      const { error: err } = await supabase.auth.updateUser({ password: form.password });
      if (err) return setError(translateAuthError(err, tr));
      await supabase.auth.signOut();
      setForm((f) => ({ ...f, password: "", confirm: "" }));
      setMode("login");
      setInfo(tr.resetSuccess);
      onPasswordRecoveryDone?.();
    } finally {
      setLoading(false);
    }
  }

  return {
    tr,
    theme,
    setTheme,
    lang,
    setLang,
    currentTheme,
    nextTheme,
    mode,
    isLogin,
    isForgot,
    isReset,
    error,
    info,
    loading,
    form,
    upd,
    switchMode,
    submit,
    submitForgot,
    submitReset,
  };
}
