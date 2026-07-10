import { useState } from "react";
import "./css/base.css";
import "./css/App.css";
import "./css/components.css";
import "./css/chatpanel.css";
import "./css/pages/dashboard.css";
import "./css/pages/transactions.css";
import "./css/pages/categories.css";
import "./css/pages/budgets.css";
import "./css/pages/reports.css";
import "./css/pages/goals.css";
import "./css/Theme-Lg.css";
import Auth from "./Auth";
import { i18n } from "../models/i18n";
import { NAV } from "../models/constants";
import { useApp } from "../controllers/useApp";
import { Icon, Sprite, FlagVN, FlagGB } from "./components/icons";
import ChatPanel from "./components/ChatPanel";
import SearchBar from "./components/SearchBar";
import Dashboard from "./pages/Dashboard";
import Transactions from "./pages/Transactions";
import Categories from "./pages/Categories";
import Budgets from "./pages/Budgets";
import Reports from "./pages/Reports";
import Goals from "./pages/Goals";
import Settings from "./pages/Settings";
import Profile from "./pages/Profile";

const VIEWS = {
  dashboard: Dashboard,
  transactions: Transactions,
  categories: Categories,
  budgets: Budgets,
  reports: Reports,
  goals: Goals,
};

export default function App() {
  const {
    view,
    setView,
    query,
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
    showLogout,
    setShowLogout,
    currentTheme,
    nextTheme,
    onSearch,
    toggleLang,
    logout,
  } = useApp();

  const [showProfile, setShowProfile] = useState(false);
  const t = i18n[lang];

  if (!authed)
    return (
      <>
        <Sprite />
        <Auth
          onAuthed={() => setAuthed(true)}
          theme={theme}
          setTheme={setTheme}
          lang={lang}
          setLang={setLang}
        />
      </>
    );

  const ViewComp = VIEWS[view];
  const [title, sub] = t.titles[view] ?? [view, ""];

  return (
    <div className="root" data-theme={theme}>
      <Sprite />

      <div className="app">
        <aside className="sidebar">
          <div className="brand">
            <div className="logo">
              <Icon n="i-wallet" size={20} />
            </div>
            <div>
              <b>MoneyWise</b>
              <small>{t.brandSub}</small>
            </div>
          </div>

          <div className="streak">
            <span className="fire">🔥</span>
            <div>
              <b>{t.streakDays(12)}</b>
              <span>{t.streak}</span>
            </div>
          </div>

          <nav className="nav">
            {NAV.map((item, i) =>
              item.group ? (
                <div className="nav-label" key={i}>
                  {t.group[item.group]}
                </div>
              ) : (
                <div
                  key={i}
                  className={"nav-link" + (view === item.id ? " active" : "")}
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
            <div
              className="userchip"
              onClick={() => setShowProfile(true)}
              style={{ cursor: "pointer" }}
              title={t.nav.profile}
            >
              <div className="ava">TH</div>
              <div style={{ flex: "1" }}>
                <b>Thi Nguyễn</b>
                <small>thi@huflit.edu.vn</small>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowLogout(true);
                }}
                aria-label={t.settings.logout}
                title={t.settings.logout}
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
              <SearchBar query={query} onSearch={onSearch} t={t} />

              <div className="themeswitch">
                <div
                  className={"theme-dot " + currentTheme.dot + " sel"}
                  title={`${currentTheme.name} → ${nextTheme.name}`}
                  onClick={() => setTheme(nextTheme.id)}
                ></div>
              </div>

              <div className="themeswitch">
                <div
                  className="theme-dot"
                  style={{ overflow: "hidden", padding: 0, border: "none" }}
                  title={lang === "vi" ? "Tiếng Việt" : "English"}
                  onClick={toggleLang}
                >
                  {lang === "vi" ? <FlagVN /> : <FlagGB />}
                </div>
              </div>

              <button className="icon-btn">
                <Icon n="i-bell" />
                <span className="dot"></span>
              </button>
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

      {showProfile && (
        <div
          onClick={() => setShowProfile(false)}
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
            className="scroll-hide"
            style={{
              width: "min(94vw, 520px)",
              maxHeight: "88vh",
              overflowY: "auto",
              position: "relative",
              animation: "fade 0.2s ease",
            }}
          >
            <button
              onClick={() => setShowProfile(false)}
              aria-label="Đóng"
              style={{
                position: "absolute",
                top: "10px",
                right: "10px",
                zIndex: 2,
                width: "34px",
                height: "34px",
                borderRadius: "50%",
                border: "1px solid var(--border)",
                background: "var(--surface)",
                color: "var(--text-dim)",
                cursor: "pointer",
                fontSize: "1.1rem",
                lineHeight: 1,
              }}
            >
              ✕
            </button>
            <Profile
              t={t}
              fontSize={fontSize}
              setFontSize={setFontSize}
              onLogout={() => {
                setShowProfile(false);
                setShowLogout(true);
              }}
            />
          </div>
        </div>
      )}

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
              {t.settings.logout}?
            </h3>
            <p
              style={{
                fontSize: "0.85rem",
                color: "var(--text-dim)",
                lineHeight: 1.5,
                marginBottom: "22px",
              }}
            >
              {lang === "vi"
                ? "Bạn có chắc muốn đăng xuất khỏi tài khoản này?"
                : "Are you sure you want to log out of this account?"}
            </p>
            <div style={{ display: "flex", gap: "10px" }}>
              <button
                className="btn"
                style={{ flex: 1 }}
                onClick={() => setShowLogout(false)}
              >
                {t.transactions.cancel}
              </button>
              <button
                className="btn"
                style={{
                  flex: 1,
                  background: "var(--danger)",
                  color: "#fff",
                  border: "none",
                }}
                onClick={logout}
              >
                {t.settings.logout}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}