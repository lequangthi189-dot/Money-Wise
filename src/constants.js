// Hằng số dùng chung: menu điều hướng + danh sách theme
export const NAV = [
  { group: "overview" },
  { id: "dashboard", icon: "i-grid" },
  { id: "transactions", icon: "i-swap" },
  { group: "manage" },
  { id: "categories", icon: "i-tag" },
  { id: "budgets", icon: "i-gauge" },
  { id: "reports", icon: "i-chart" },
  { id: "goals", icon: "i-flag" },
  { group: "admin", adminOnly: true },
  { id: "admin", icon: "i-shield", adminOnly: true },
  { group: "other" },
  { id: "settings", icon: "i-gear" },
];

export const THEMES = [
  {
    id: "glass",
    dot: "td-glass",
    prev: "pv-glass",
    name: "Modern Glassmorphism",
  },
  { id: "neu", dot: "td-neu", prev: "pv-neu", name: "Soft UI / Neumorphism" },
];
