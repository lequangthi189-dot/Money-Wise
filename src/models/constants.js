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

// Role hệ thống. Dùng chung 1 nguồn để tránh gõ tay chuỗi "admin" rải rác.
export const ROLES = {
  ADMIN: "admin",
  USER: "user",
};

// Admin gốc của hệ thống: không admin nào được thu hồi quyền admin của tài
// khoản này. Chặn thật nằm ở trigger tg_chan_thu_hoi_admin_goc dưới DB
// (xem db/bao_ve_admin_goc.sql) — hằng số ở đây chỉ để tắt nút cho khớp,
// vì bất kỳ ai cũng có thể gọi thẳng RPC mà không đi qua giao diện.
export const ROOT_ADMIN_EMAIL = "lqthi4006@gmail.com";

// Menu riêng cho khu vực quản trị (admin). Tách khỏi NAV vì admin không
// dùng các trang cá nhân (transactions, budgets, goals... của user thường).
export const ADMIN_NAV = [
  { group: "admin" },
  { id: "admin-users", icon: "i-users" },
  { id: "admin-categories", icon: "i-tag" },
  { id: "admin-stats", icon: "i-chart" },
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
