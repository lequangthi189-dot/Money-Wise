import { useState, useEffect } from "react";
import { THEMES, ROLES } from "../models/constants";

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
  const [showLogout, setShowLogout] = useState(false);

  useEffect(() => {
    document.documentElement.style.fontSize = fontSize + "px";
  }, [fontSize]);

  const currentTheme = THEMES.find((th) => th.id === theme) ?? THEMES[0];
  const currentThemeIndex = THEMES.findIndex((th) => th.id === currentTheme.id);
  const nextTheme = THEMES[(currentThemeIndex + 1) % THEMES.length];

  function onSearch(value) {
    setQuery(value);
  }

  function toggleLang() {
    setLang((l) => (l === "vi" ? "en" : "vi"));
  }

  function logout() {
    setShowLogout(false);
    setView("dashboard");
    setAuthed(false);
    setRole(ROLES.USER);
    setCurrentEmail("");
  }

  function completeAuth(email, userRole) {
    setRole(userRole);
    setCurrentEmail(email);
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
    role,
    setRole,
    currentEmail,
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
