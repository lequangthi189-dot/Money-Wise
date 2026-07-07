import { useState, useEffect } from "react";
import "./Css/base.css";
import "./App.css";
import "./Css/components.css";
import "./Css/chatpanel.css";
import "./Css/Pages/dashboard.css";
import "./Css/Pages/transactions.css";
import "./Css/Pages/categories.css";
import "./Css/Pages/budgets.css";
import "./Css/Pages/reports.css";
import "./Css/Pages/goals.css";
import "./Theme-Lg.css";
import Auth from "./Auth";
import { i18n } from "./i18n";
import { NAV, THEMES } from "./constants";
import { Icon, Sprite, FlagVN, FlagGB } from "./components/icons";
import ChatPanel from "./components/ChatPanel";
import Dashboard from "./pages/Dashboard";
import Transactions from "./pages/Transactions";
import Categories from "./pages/Categories";
import Budgets from "./pages/Budgets";
import Reports from "./pages/Reports";
import Goals from "./pages/Goals";
import Settings from "./pages/Settings";
import Admin from "./pages/Admin";

const VIEWS = {
  dashboard: Dashboard,
  transactions: Transactions,
  categories: Categories,
  budgets: Budgets,
  reports: Reports,
  goals: Goals,
  admin: Admin,
};

export default function App() {
  const [view, setView] = useState("dashboard");
  const [query, setQuery] = useState("");
  const [theme, setTheme] = useState("glass");
  const [lang, setLang] = useState("vi");
  const [chatOpen, setChatOpen] = useState(false);
  const [fontSize, setFontSize] = useState(16);
  const [authed, setAuthed] = useState(false);
  const [role, setRole] = useState("user");
  const [showLogout, setShowLogout] = useState(false);

  useEffect(() => {
    document.documentElement.style.fontSize = fontSize + "px";
  }, [fontSize]);

  if (!authed)
    return (
      <Auth
        onAuthed={(form) => {
          setAuthed(true);
          setRole(form?.role === "admin" ? "admin" : "user");
        }}
        theme={theme}
        setTheme={setTheme}
      />
    );

  const t = i18n[lang];
  const [title, sub] = t.titles[view];
  const ViewComp = VIEWS[view];
  const currentTheme = THEMES.find((th) => th.id === theme) ?? THEMES[0];
  const currentThemeIndex = THEMES.findIndex((th) => th.id === currentTheme.id);
  const nextTheme = THEMES[(currentThemeIndex + 1) % THEMES.length];

  return (
    <div className="root" data-theme={theme}>
      <Sprite />
      <div className="app">
        <aside className="sidebar">
          <div className="brand">
            <div className="logo">
              <Icon n="i-wallet" />
            </div>
            <div>
              <b>MoneyWise</b>
              <small>{t.brandSub}</small>
            </div>
          </div>

          <div className="streak">
            <span className="fire" style={{ fontSize: "1.2rem" }}>
              🔥
            </span>
            <div>
              <b>{t.streakDays(12)}</b>
              <span>{t.streak}</span>
            </div>
          </div>

          <nav className="nav">
            {NAV.filter((item) => !(item.adminOnly && role !== "admin")).map(
              (item, i) =>
                item.group ? (
                  <div key={i} className="nav-label">
                    {t.group[item.group]}
                  </div>
                ) : (
                  <div
                    key={i}
                    className={
                      "nav-link" + (view === item.id ? " active" : "")
                    }
                    onClick={() => setView(item.id)}
                  >
                    <Icon n={item.icon} />
                    <span>{t.nav[item.id]}</span>
                  </div>
                ),
            )}
          </nav>

          <div className="nav-spacer"></div>
          <div className="nav-foot">
            <div className="userchip">
              <div className="ava">TH</div>
              <div style={{ flex: "1" }}>
                <b>Thi Nguyễn</b>
                <small>thi@huflit.edu.vn</small>
              </div>
              <button
                onClick={() => setShowLogout(true)}
                aria-label="Đăng xuất"
                title="Đăng xuất"
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "var(--text-dim)",
                  display: "grid",
                  placeItems: "center",
                  padding: "4px",
                }}
              >
                <Icon n="i-logout" size={17} />
              </button>
            </div>
          </div>
        </aside>

        <main className="main">
          <header className="topbar">
            <div className="page-title">
              <h1>{title}</h1>
              <p>{sub}</p>
            </div>
            <div className="top-actions">
              <div className="search">
                <Icon n="i-search" size={16} />
                <input
                  placeholder={t.search}
                  value={query}
                  onChange={(e) => {
                    setQuery(e.target.value);
                    if (e.target.value && view !== "transactions")
                      setView("transactions");
                  }}
                />
              </div>

              <div className="themeswitch">
                <div
                  className={"theme-dot " + currentTheme.dot + " sel"}
                  title={`${currentTheme.name} - click to switch ${nextTheme.name}`}
                  onClick={() => setTheme(nextTheme.id)}
                ></div>
              </div>

              {/* Dot đổi ngôn ngữ: bấm để chuyển Việt <-> Anh */}
              <div className="themeswitch">
                <div
                  className="theme-dot"
                  style={{ overflow: "hidden", padding: 0, border: "none" }}
                  title={
                    lang === "vi"
                      ? "Tiếng Việt — bấm để chuyển English"
                      : "English — click to switch Tiếng Việt"
                  }
                  onClick={() => setLang((l) => (l === "vi" ? "en" : "vi"))}
                >
                  {lang === "vi" ? <FlagVN /> : <FlagGB />}
                </div>
              </div>

              <div className="icon-btn">
                <Icon n="i-bell" size={19} />
                <span className="dot"></span>
              </div>
            </div>
          </header>

          <div className="content">
            <section className="view show" key={view}>
              {view === "settings" ? (
                <Settings
                  theme={theme}
                  setTheme={setTheme}
                  fontSize={fontSize}
                  setFontSize={setFontSize}
                  lang={lang}
                  setLang={setLang}
                  s={t.settings}
                />
              ) : (
                <ViewComp query={query} t={t} />
              )}
            </section>
          </div>
        </main>
      </div>

      <button className="fab" onClick={() => setChatOpen((o) => !o)}>
        <Icon n="i-msg" size={26} />
      </button>
      {chatOpen && <ChatPanel onClose={() => setChatOpen(false)} />}

      {showLogout && (
        <div
          onClick={() => setShowLogout(false)}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 100,
            background: "rgba(0,0,0,0.5)",
            backdropFilter: "blur(3px)",
            WebkitBackdropFilter: "blur(3px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px",
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="card glass"
            style={{
              width: "min(92vw, 360px)",
              padding: "26px 24px",
              textAlign: "center",
              animation: "fade 0.2s ease",
            }}
          >
            <div
              style={{
                width: "52px",
                height: "52px",
                borderRadius: "50%",
                background: "rgba(248,113,113,0.15)",
                color: "var(--danger)",
                display: "grid",
                placeItems: "center",
                margin: "0 auto 16px",
              }}
            >
              <Icon n="i-logout" size={26} />
            </div>
            <h3
              style={{
                fontSize: "1.15rem",
                fontWeight: 700,
                marginBottom: "8px",
              }}
            >
              Đăng xuất?
            </h3>
            <p
              style={{
                fontSize: "0.85rem",
                color: "var(--text-dim)",
                lineHeight: 1.5,
                marginBottom: "22px",
              }}
            >
              Bạn có chắc muốn đăng xuất khỏi tài khoản này?
            </p>
            <div style={{ display: "flex", gap: "10px" }}>
              <button
                className="btn"
                style={{ flex: 1 }}
                onClick={() => setShowLogout(false)}
              >
                Hủy
              </button>
              <button
                className="btn"
                style={{
                  flex: 1,
                  background: "var(--danger)",
                  color: "#fff",
                  border: "none",
                }}
                onClick={() => {
                  setShowLogout(false);
                  setView("dashboard");
                  setAuthed(false);
                  setRole("user");
                }}
              >
                Đăng xuất
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
