import { useState } from "react";
import "./App.css";
import "./Theme-Lg.css";

const THEMES = [
  { id: "glass", dot: "td-glass", name: "Modern Glassmorphism" },
  { id: "dark", dot: "td-dark", name: "Sleek Dark Minimalist" },
  { id: "neu", dot: "td-neu", name: "Soft UI / Neumorphism" },
];

const T = {
  vi: {
    tagline: "Quản lý chi tiêu thông minh cho sinh viên",
    login: "Đăng nhập",
    register: "Đăng ký",
    name: "Họ tên đầy đủ",
    username: "Username",
    email: "Email",
    phone: "Số điện thoại",
    password: "Mật khẩu",
    confirm: "Xác nhận mật khẩu",
    forgot: "Quên mật khẩu?",
    submitLogin: "Đăng nhập",
    submitRegister: "Tạo tài khoản",
    noAcc: "Chưa có tài khoản?",
    hasAcc: "Đã có tài khoản?",
    goRegister: "Đăng ký ngay",
    goLogin: "Đăng nhập",
    streakLogin:
      "Đăng nhập mỗi ngày để giữ chuỗi ghi chép — chuỗi được ghi nhận trong vòng 30 giây sau khi đăng nhập thành công.",
    streakRegister:
      "Sau khi đăng ký, hãy đăng nhập 3 ngày liên tục để kích hoạt chuỗi ghi chép của bạn.",
    errFill: "Vui lòng điền đầy đủ tất cả thông tin.",
    errLogin: "Vui lòng nhập email và mật khẩu.",
    errLen: "Mật khẩu cần ít nhất 6 ký tự.",
    errMatch: "Mật khẩu xác nhận không khớp.",
    phName: "Nguyễn Văn A",
    phUser: "nguyenvana",
    phEmail: "ban@email.com",
    phPhone: "0901234567",
  },
  en: {
    tagline: "Smart money management for students",
    login: "Sign in",
    register: "Sign up",
    name: "Full name",
    username: "Username",
    email: "Email",
    phone: "Phone number",
    password: "Password",
    confirm: "Confirm password",
    forgot: "Forgot password?",
    submitLogin: "Sign in",
    submitRegister: "Create account",
    noAcc: "Don't have an account?",
    hasAcc: "Already have an account?",
    goRegister: "Sign up now",
    goLogin: "Sign in",
    streakLogin:
      "Sign in every day to keep your logging streak — it is recorded within 30 seconds after a successful login.",
    streakRegister:
      "After signing up, sign in for 3 consecutive days to activate your logging streak.",
    errFill: "Please fill in all the fields.",
    errLogin: "Please enter email and password.",
    errLen: "Password must be at least 6 characters.",
    errMatch: "Password confirmation does not match.",
    phName: "John Doe",
    phUser: "johndoe",
    phEmail: "you@email.com",
    phPhone: "0901234567",
  },
};
const inputWrap = { position: "relative" };
const eyeBtn = {
  position: "absolute",
  right: "6px",
  top: "50%",
  transform: "translateY(-50%)",
  background: "none",
  border: "none",
  color: "var(--text-dim)",
  cursor: "pointer",
  display: "grid",
  placeItems: "center",
  width: "30px",
  height: "30px",
};
const linkStyle = {
  color: "var(--accent)",
  cursor: "pointer",
  textDecoration: "none",
};

function AuthIcons() {
  return (
    <svg
      width="0"
      height="0"
      style={{ position: "absolute" }}
      aria-hidden="true"
    >
      <symbol
        id="a-wallet"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M19 7V5a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a1 1 0 0 0 1-1v-2" />
        <path d="M3 5v14a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1v-4" />
      </symbol>
      <symbol
        id="a-eye"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
        <circle cx="12" cy="12" r="3" />
      </symbol>
      <symbol
        id="a-eye-off"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
        <line x1="1" y1="1" x2="23" y2="23" />
      </symbol>
    </svg>
  );
}

function Ic({ n, size = 20 }) {
  return (
    <svg width={size} height={size}>
      <use href={"#" + n} />
    </svg>
  );
}

function FlagVN() {
  return (
    <svg
      viewBox="0 0 30 20"
      width="100%"
      height="100%"
      preserveAspectRatio="xMidYMid slice"
      style={{ display: "block" }}
    >
      <rect width="30" height="20" fill="#da251d" />
      <polygon
        points="15,4 16.35,8.15 20.71,8.15 17.18,10.71 18.53,14.85 15,12.29 11.47,14.85 12.82,10.71 9.29,8.15 13.65,8.15"
        fill="#ffff00"
      />
    </svg>
  );
}

function FlagGB() {
  return (
    <svg
      viewBox="0 0 60 30"
      width="100%"
      height="100%"
      preserveAspectRatio="xMidYMid slice"
      style={{ display: "block" }}
    >
      <clipPath id="gb-clip">
        <path d="M0,0 v30 h60 v-30 z" />
      </clipPath>
      <clipPath id="gb-diag">
        <path d="M30,15 h30 v15 z v15 h-30 z h-30 v-15 z v-15 h30 z" />
      </clipPath>
      <g clipPath="url(#gb-clip)">
        <path d="M0,0 v30 h60 v-30 z" fill="#012169" />
        <path d="M0,0 L60,30 M60,0 L0,30" stroke="#ffffff" strokeWidth="6" />
        <path
          d="M0,0 L60,30 M60,0 L0,30"
          clipPath="url(#gb-diag)"
          stroke="#c8102e"
          strokeWidth="4"
        />
        <path d="M30,0 v30 M0,15 h60" stroke="#ffffff" strokeWidth="10" />
        <path d="M30,0 v30 M0,15 h60" stroke="#c8102e" strokeWidth="6" />
      </g>
    </svg>
  );
}

export default function Auth({
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
  const tr = T[lang];
  const currentTheme = THEMES.find((t) => t.id === theme) ?? THEMES[0];
  const currentThemeIndex = THEMES.findIndex((t) => t.id === currentTheme.id);
  const nextTheme = THEMES[(currentThemeIndex + 1) % THEMES.length];

  const [mode, setMode] = useState("login"); // 'login' | 'register'
  const [showPw, setShowPw] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState("");
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

  function switchMode(m) {
    setMode(m);
    setError("");
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
      if (form.password.length < 6) return setError(tr.errLen);
      if (form.password !== form.confirm) return setError(tr.errMatch);
    }
    // TODO: gọi Supabase auth ở đây (signInWithPassword / signUp), rồi:
    if (onAuthed) onAuthed(form);
  }

  return (
    <div
      className="root"
      data-theme={theme}
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
        position: "relative",
      }}
    >
      <AuthIcons />

      <div style={{ width: "100%", maxWidth: "440px" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            gap: "10px",
            marginBottom: "16px",
          }}
        >
          {/* Dot đổi theme */}
          <div className="themeswitch">
            <div
              className={"theme-dot " + currentTheme.dot + " sel"}
              title={`${currentTheme.name} - click to switch ${nextTheme.name}`}
              onClick={() => setTheme(nextTheme.id)}
            ></div>
          </div>
          {/* Dot đổi ngôn ngữ */}
          <div className="themeswitch">
            <div
              className="theme-dot"
              style={{ overflow: "hidden", padding: 0, border: "none" }}
              title={
                lang === "vi"
                  ? "Tiếng Việt — bấm để chuyển English"
                  : "English — click to switch Tiếng Việt"
              }
              onClick={() => setLang(lang === "vi" ? "en" : "vi")}
            >
              {lang === "vi" ? <FlagVN /> : <FlagGB />}
            </div>
          </div>
        </div>

        <div style={{ textAlign: "center", marginBottom: "22px" }}>
          <div
            className="logo"
            style={{
              width: "56px",
              height: "56px",
              borderRadius: "16px",
              margin: "0 auto 14px",
            }}
          >
            <Ic n="a-wallet" size={28} />
          </div>
          <h1
            style={{
              fontSize: "1.5rem",
              fontWeight: 700,
              letterSpacing: "-.4px",
            }}
          >
            MoneyWise
          </h1>
          <p
            style={{
              fontSize: ".85rem",
              color: "var(--text-dim)",
              marginTop: "4px",
            }}
          >
            {tr.tagline}
          </p>
        </div>

        <div className="card glass" style={{ padding: "24px" }}>
          <div className="seg" style={{ marginBottom: "20px" }}>
            <button
              className={isLogin ? "on" : ""}
              onClick={() => switchMode("login")}
            >
              {tr.login}
            </button>
            <button
              className={!isLogin ? "on" : ""}
              onClick={() => switchMode("register")}
            >
              {tr.register}
            </button>
          </div>

          {!isLogin && (
            <>
              <div className="field">
                <label>{tr.name}</label>
                <input
                  value={form.name}
                  onChange={upd("name")}
                  placeholder={tr.phName}
                />
              </div>
              <div className="field">
                <label>{tr.username}</label>
                <input
                  value={form.username}
                  onChange={upd("username")}
                  placeholder={tr.phUser}
                />
              </div>
            </>
          )}

          <div className="field">
            <label>{tr.email}</label>
            <input
              type="email"
              value={form.email}
              onChange={upd("email")}
              placeholder={tr.phEmail}
            />
          </div>

          {!isLogin && (
            <div className="field">
              <label>{tr.phone}</label>
              <input
                type="tel"
                value={form.phone}
                onChange={upd("phone")}
                placeholder={tr.phPhone}
              />
            </div>
          )}

          <div className="field">
            <label>{tr.password}</label>
            <div style={inputWrap}>
              <input
                type={showPw ? "text" : "password"}
                value={form.password}
                onChange={upd("password")}
                placeholder="••••••••"
                style={{ paddingRight: "42px" }}
              />
              <button
                type="button"
                onClick={() => setShowPw((s) => !s)}
                style={eyeBtn}
                aria-label="show/hide"
              >
                <Ic n={showPw ? "a-eye-off" : "a-eye"} size={18} />
              </button>
            </div>
          </div>

          {!isLogin && (
            <div className="field">
              <label>{tr.confirm}</label>
              <div style={inputWrap}>
                <input
                  type={showConfirm ? "text" : "password"}
                  value={form.confirm}
                  onChange={upd("confirm")}
                  placeholder="••••••••"
                  style={{ paddingRight: "42px" }}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm((s) => !s)}
                  style={eyeBtn}
                  aria-label="show/hide"
                >
                  <Ic n={showConfirm ? "a-eye-off" : "a-eye"} size={18} />
                </button>
              </div>
            </div>
          )}

          {isLogin && (
            <div
              style={{
                textAlign: "right",
                marginTop: "-2px",
                marginBottom: "14px",
              }}
            >
              <a style={{ ...linkStyle, fontSize: ".8rem" }}>{tr.forgot}</a>
            </div>
          )}

          {error && (
            <div
              style={{
                fontSize: ".8rem",
                color: "var(--danger)",
                background: "rgba(248,113,113,.12)",
                border: "1px solid rgba(248,113,113,.3)",
                borderRadius: "10px",
                padding: "10px 12px",
                marginBottom: "14px",
              }}
            >
              {error}
            </div>
          )}

          <button
            className="btn btn-primary"
            style={{ width: "100%" }}
            onClick={submit}
          >
            {isLogin ? tr.submitLogin : tr.submitRegister}
          </button>

          <div
            style={{
              display: "flex",
              gap: "10px",
              alignItems: "flex-start",
              marginTop: "16px",
              padding: "11px 13px",
              borderRadius: "12px",
              background: "var(--surface-2)",
              fontSize: ".76rem",
              color: "var(--text-dim)",
              lineHeight: 1.5,
            }}
          >
            <span style={{ fontSize: "1.1rem", flex: "0 0 auto" }}>🔥</span>
            <span>{isLogin ? tr.streakLogin : tr.streakRegister}</span>
          </div>
        </div>

        <p
          style={{
            textAlign: "center",
            fontSize: ".78rem",
            color: "var(--text-faint)",
            marginTop: "18px",
          }}
        >
          {isLogin ? (
            <>
              {tr.noAcc}{" "}
              <a onClick={() => switchMode("register")} style={linkStyle}>
                {tr.goRegister}
              </a>
            </>
          ) : (
            <>
              {tr.hasAcc}{" "}
              <a onClick={() => switchMode("login")} style={linkStyle}>
                {tr.goLogin}
              </a>
            </>
          )}
        </p>
      </div>
    </div>
  );
}
