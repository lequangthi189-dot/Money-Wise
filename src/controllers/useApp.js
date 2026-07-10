import { useState, useEffect } from "react";
import { THEMES } from "../models/constants";

// Controller: trạng thái cấp ứng dụng (view hiện tại, tìm kiếm, theme, ngôn ngữ,
// cỡ chữ, đăng nhập...) và các giá trị suy ra từ theme.
export function useApp() {
  const [view, setView] = useState("dashboard");
  const [query, setQuery] = useState("");
  const [theme, setTheme] = useState("glass");
  const [lang, setLang] = useState("vi");
  const [chatOpen, setChatOpen] = useState(false);
  const [fontSize, setFontSize] = useState(16);
  const [authed, setAuthed] = useState(false);
  const [showLogout, setShowLogout] = useState(false);

  useEffect(() => {
    document.documentElement.style.fontSize = fontSize + "px";
  }, [fontSize]);

  const currentTheme = THEMES.find((th) => th.id === theme) ?? THEMES[0];
  const currentThemeIndex = THEMES.findIndex((th) => th.id === currentTheme.id);
  const nextTheme = THEMES[(currentThemeIndex + 1) % THEMES.length];

  // Chỉ cập nhật từ khóa. Kết quả hiện ngay trong dropdown của thanh tìm kiếm,
  // KHÔNG tự chuyển trang.
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
    showLogout,
    setShowLogout,
    currentTheme,
    nextTheme,
    onSearch,
    toggleLang,
    logout,
  };
}