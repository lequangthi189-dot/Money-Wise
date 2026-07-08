// Model: dữ liệu trang Tổng quan. DONUT là hình học tĩnh của biểu đồ tròn;
// các builder nhận `t` (i18n) để lấy tên danh mục đã dịch.
export const DONUT = [
  { color: "#f87171", dash: "34 66", off: "0" },
  { color: "#60a5fa", dash: "22 78", off: "-34" },
  { color: "#fbbf24", dash: "18 82", off: "-56" },
  { color: "#a78bfa", dash: "14 86", off: "-74" },
  { color: "#34d399", dash: "12 88", off: "-88" },
];

export const getLegend = (t) => [
  { c: "#f87171", name: t.cats.food, v: "741.000 ₫" },
  { c: "#60a5fa", name: t.cats.move, v: "480.000 ₫" },
  { c: "#fbbf24", name: t.cats.fun, v: "392.000 ₫" },
  { c: "#a78bfa", name: t.cats.coffee, v: "305.000 ₫" },
  { c: "#34d399", name: t.cats.other, v: "262.000 ₫" },
];

export const getGoals = (t) => [
  {
    icon: "📱",
    name: t.goals.phone,
    pct: 61,
    bar: "",
    cur: "9.200.000",
    tot: "15.000.000",
  },
  {
    icon: "✈️",
    name: t.goals.trip,
    pct: 62,
    bar: "ok",
    cur: "3.100.000",
    tot: "5.000.000",
  },
  {
    icon: "💻",
    name: t.goals.laptop,
    pct: 16,
    bar: "",
    cur: "4.000.000",
    tot: "25.000.000",
  },
];

export const getRecent = (d) => [
  {
    icon: "☕",
    cls: "c-coffee",
    name: "Trà sữa Phúc Long",
    when: `${d.today} · 14:20`,
    mkey: "ewallet",
    type: "out",
    amt: "-35.000 ₫",
  },
  {
    icon: "🍜",
    cls: "c-food",
    name: "Cơm trưa",
    when: `${d.today} · 12:05`,
    mkey: "cash",
    type: "out",
    amt: "-45.000 ₫",
  },
  {
    icon: "🛵",
    cls: "c-move",
    name: "Đổ xăng",
    when: `${d.today} · 08:30`,
    mkey: "cash",
    type: "out",
    amt: "-65.000 ₫",
  },
  {
    icon: "💰",
    cls: "c-salary",
    name: "Lương làm thêm",
    when: d.yesterday,
    mkey: "transfer",
    type: "in",
    amt: "+1.500.000 ₫",
  },
];
