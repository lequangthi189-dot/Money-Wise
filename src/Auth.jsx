import { useState } from "react";
import "./App.css";
import "./Theme-Lg.css";
import FloatingInput from "./components/FloatingInput";

const THEMES = [
  { id: "glass", dot: "td-glass", name: "Modern Glassmorphism" },
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
    errEmailOnly: "Vui lòng nhập email.",
    forgotTitle: "Khôi phục mật khẩu",
    forgotDesc: "Nhập email đã đăng ký để đặt lại mật khẩu.",
    emailLabel: "Địa chỉ Email",
    emailPlaceholder: "Nhập email",
    sendReset: "Gửi",
    resetSent:
      "Đã gửi liên kết đặt lại tới email của bạn. Vui lòng kiểm tra hộp thư (cả mục Spam).",
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
    errEmailOnly: "Please enter your email.",
    forgotTitle: "Recover password",
    forgotDesc: "Enter your registered email to reset your password.",
    emailLabel: "Email address",
    emailPlaceholder: "Enter email",
    sendReset: "Send",
    resetSent:
      "A reset link has been sent to your email. Please check your inbox (including Spam).",
  },
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
      if (form.password.length < 6) return setError(tr.errLen);
      if (form.password !== form.confirm) return setError(tr.errMatch);
    }
    // TODO: gọi Supabase auth ở đây (signInWithPassword / signUp), rồi:
    if (onAuthed) onAuthed(form);
  }

  function submitForgot() {
    setError("");
    setInfo("");
    if (!form.email) return setError(tr.errEmailOnly);
    // TODO: nối Supabase để gửi email đặt lại mật khẩu:
    //   const { error } = await supabase.auth.resetPasswordForEmail(form.email, {
    //     redirectTo: window.location.origin,
    //   });
    //   if (error) return setError(error.message);
    setInfo(tr.resetSent);
  }

  const errorBox = error && (
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
  );

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
          {isForgot ? (
            <>
              <h2
                style={{
                  fontSize: "1.6rem",
                  fontWeight: 700,
                  textAlign: "center",
                  marginBottom: "12px",
                }}
              >
                {tr.forgotTitle}
              </h2>
              <p
                style={{
                  fontSize: ".82rem",
                  color: "var(--text-dim)",
                  textAlign: "center",
                  marginBottom: "22px",
                  lineHeight: 1.6,
                }}
              >
                {tr.forgotDesc}
              </p>

              <div className="field">
                <input
                  type="email"
                  value={form.email}
                  onChange={upd("email")}
                  placeholder={tr.emailPlaceholder}
                  inputMode="email"
                  autoComplete="email"
                />
              </div>

              {info && (
                <div
                  style={{
                    fontSize: ".8rem",
                    color: "var(--ok, #34d399)",
                    background: "rgba(52,211,153,.12)",
                    border: "1px solid rgba(52,211,153,.3)",
                    borderRadius: "10px",
                    padding: "10px 12px",
                    marginBottom: "14px",
                  }}
                >
                  {info}
                </div>
              )}
              {errorBox}

              <button
                className="btn btn-primary"
                style={{ width: "100%" }}
                onClick={submitForgot}
              >
                {tr.sendReset}
              </button>

              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontSize: ".82rem",
                  marginTop: "18px",
                }}
              >
                <a onClick={() => switchMode("login")} style={linkStyle}>
                  {tr.goLogin}
                </a>
                <a onClick={() => switchMode("register")} style={linkStyle}>
                  {tr.goRegister}
                </a>
              </div>
            </>
          ) : (
            <>
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
                  <FloatingInput
                    label={tr.name}
                    value={form.name}
                    onChange={upd("name")}
                    maxLength={50}
                    name="name"
                    autoComplete="name"
                  />
                  <FloatingInput
                    label={tr.username}
                    value={form.username}
                    onChange={upd("username")}
                    maxLength={30}
                    name="username"
                    autoComplete="username"
                  />
                </>
              )}

              <FloatingInput
                label={tr.email}
                type="email"
                value={form.email}
                onChange={upd("email")}
                name="email"
                autoComplete="email"
                inputMode="email"
              />

              {!isLogin && (
                <FloatingInput
                  label={tr.phone}
                  type="tel"
                  inputMode="tel"
                  value={form.phone}
                  onChange={upd("phone")}
                />
              )}

              <FloatingInput
                label={tr.password}
                type="password"
                value={form.password}
                onChange={upd("password")}
                name="password"
                autoComplete={isLogin ? "current-password" : "new-password"}
              />

              {!isLogin && (
                <FloatingInput
                  label={tr.confirm}
                  type="password"
                  value={form.confirm}
                  onChange={upd("confirm")}
                  name="confirm"
                  autoComplete="new-password"
                />
              )}

              {isLogin && (
                <div
                  style={{
                    textAlign: "right",
                    marginTop: "-2px",
                    marginBottom: "14px",
                  }}
                >
                  <a
                    onClick={() => switchMode("forgot")}
                    style={{ ...linkStyle, fontSize: ".8rem" }}
                  >
                    {tr.forgot}
                  </a>
                </div>
              )}

              {errorBox}

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
            </>
          )}
        </div>

        {!isForgot && (
          <p
            style={{
              textAlign: "center",
              fontSize: ".78rem",
              color: "var(--text-faint)",
              marginTop: "18px",
            }}
          >
            {mode === "register" ? (
              <>
                {tr.hasAcc}{" "}
                <a onClick={() => switchMode("login")} style={linkStyle}>
                  {tr.goLogin}
                </a>
              </>
            ) : (
              <>
                {tr.noAcc}{" "}
                <a onClick={() => switchMode("register")} style={linkStyle}>
                  {tr.goRegister}
                </a>
              </>
            )}
          </p>
        )}
      </div>
    </div>
  );
}
