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
  {
    id: "dark",
    dot: "td-dark",
    prev: "pv-dark",
    name: "Sleek Dark Minimalist",
  },
  { id: "neu", dot: "td-neu", prev: "pv-neu", name: "Soft UI / Neumorphism" },
];
