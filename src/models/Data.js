// Dữ liệu mẫu dùng chung (sau này thay bằng dữ liệu từ Supabase).
// Đặt ở models/ để cả Pages lẫn thanh tìm kiếm đều đọc được.

export const TXNS = [
  { id: 1, icon: "☕", cls: "c-coffee", name: "Trà sữa Phúc Long", date: "25/06", mkey: "ewallet", catKey: "coffee", type: "out", amount: "-35.000 ₫" },
  { id: 2, icon: "🍜", cls: "c-food", name: "Cơm trưa căng tin", date: "25/06", mkey: "cash", catKey: "food", type: "out", amount: "-45.000 ₫" },
  { id: 3, icon: "💰", cls: "c-salary", name: "Lương làm thêm", date: "24/06", mkey: "transfer", catKey: "salary", type: "in", amount: "+1.500.000 ₫" },
  { id: 4, icon: "🛵", cls: "c-move", name: "Đổ xăng", date: "24/06", mkey: "cash", catKey: "move", type: "out", amount: "-65.000 ₫" },
  { id: 5, icon: "🎮", cls: "c-fun", name: "Vé xem phim CGV", date: "23/06", mkey: "card", catKey: "fun", type: "out", amount: "-120.000 ₫" },
  { id: 6, icon: "🎓", cls: "c-salary", name: "Học bổng kỳ 2", date: "22/06", mkey: "transfer", catKey: "scholar", type: "in", amount: "+2.000.000 ₫" },
];

// Hạn mức theo danh mục. catKey -> tra tên qua t.cats[catKey]
export const BUDGETS = [
  { id: 1, icon: "☕", cls: "c-coffee", catKey: "coffee", spent: "305.000", limit: "350.000", pct: 86, bar: "warn", badge: "b-warn" },
  { id: 2, icon: "🍜", cls: "c-food", catKey: "food", spent: "741.000", limit: "1.000.000", pct: 74, bar: "", badge: "dim" },
  { id: 3, icon: "🎮", cls: "c-fun", catKey: "fun", spent: "392.000", limit: "400.000", pct: 98, bar: "danger", badge: "b-out" },
  { id: 4, icon: "🛵", cls: "c-move", catKey: "move", spent: "480.000", limit: "600.000", pct: 80, bar: "warn", badge: "dim" },
  { id: 5, icon: "🛍️", cls: "c-shop", catKey: "shop", spent: "120.000", limit: "500.000", pct: 24, bar: "ok", badge: "b-in" },
];