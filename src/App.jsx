import { useState, useEffect } from "react";
import "./App.css";
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

const VIEWS = {
  dashboard: Dashboard,
  transactions: Transactions,
  categories: Categories,
  budgets: Budgets,
  reports: Reports,
  goals: Goals,
};

export default function App() {
  const [view, setView] = useState("dashboard");
  const [theme, setTheme] = useState("glass");
  const [lang, setLang] = useState("vi");
  const [chatOpen, setChatOpen] = useState(false);
  const [fontSize, setFontSize] = useState(16);
  const [authed, setAuthed] = useState(false);

  useEffect(() => {
    document.documentElement.style.fontSize = fontSize + "px";
  }, [fontSize]);

  if (!authed)
    return (
      <Auth
        onAuthed={() => setAuthed(true)}
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
            {NAV.map((item, i) =>
              item.group ? (
                <div key={i} className="nav-label">
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
            <div className="userchip">
              <div className="ava">TH</div>
              <div style={{ flex: "1" }}>
                <b>Thi Nguyễn</b>
                <small>thi@huflit.edu.vn</small>
              </div>
              <Icon n="i-logout" size={17} />
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
                <input placeholder={t.search} />
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
                <ViewComp />
              )}
            </section>
          </div>
        </main>
      </div>

      <button className="fab" onClick={() => setChatOpen((o) => !o)}>
        <Icon n="i-msg" size={26} />
      </button>
      {chatOpen && <ChatPanel onClose={() => setChatOpen(false)} />}
    </div>
  );
}
