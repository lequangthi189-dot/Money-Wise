import { useState } from "react";
import { AUTH_TEXT, AUTH_THEMES } from "../models/authData";
import { ROLES } from "../models/constants";
import { MOCK_USERS } from "../models/adminData";

// MOCK: chưa có backend nên xác định role bằng cách tra email trong danh
// sách user mẫu (adminData.js). Khi nối backend thật, thay hàm này bằng
// role trả về từ response đăng nhập của backend.
function mockResolveRole(email) {
  const found = MOCK_USERS.find(
    (u) => u.email.toLowerCase() === (email || "").toLowerCase(),
  );
  return found ? found.role : ROLES.USER;
}

// Controller: màn hình đăng nhập/đăng ký/quên mật khẩu.
// Quản lý form, chế độ (login|register|forgot), kiểm tra hợp lệ và theme/ngôn ngữ.
export function useAuth({
  onAuthed,
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

  const currentTheme = AUTH_THEMES.find((t) => t.id === theme) ?? AUTH_THEMES[0];
  const currentThemeIndex = AUTH_THEMES.findIndex(
    (t) => t.id === currentTheme.id,
  );
  const nextTheme = AUTH_THEMES[(currentThemeIndex + 1) % AUTH_THEMES.length];

  const [mode, setMode] = useState("login"); // 'login' | 'register' | 'forgot'
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
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

  function switchMode(m) {
    setMode(m);
    setError("");
    setInfo("");
  }

  function submit() {
    setError("");
    if (isLogin) {
      if (!form.email || !form.password) return setError(tr.errLogin);
    } else {
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
    }
    // TODO: gọi API xác thực ở đây, rồi lấy role thật từ response
    // thay vì mockResolveRole().
    const role = mockResolveRole(form.email);
    if (onAuthed) onAuthed(form, role);
  }

  function submitForgot() {
    setError("");
    setInfo("");
    if (!form.email) return setError(tr.errEmailOnly);
    // TODO: gọi API gửi email đặt lại mật khẩu.
    setInfo(tr.resetSent);
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
    error,
    info,
    form,
    upd,
    switchMode,
    submit,
    submitForgot,
  };
}
