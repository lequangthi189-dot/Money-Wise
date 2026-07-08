// Model: dữ liệu Báo cáo. BARS = biểu đồ cột 6 tháng; PIE_* = biểu đồ tròn cơ cấu chi.
export const BARS = [
  { h: "55%" },
  { h: "70%" },
  { h: "48%" },
  { h: "82%" },
  { h: "64%" },
  {
    h: "73%",
    grad: "linear-gradient(180deg,var(--accent-2),rgba(34,211,238,.3))",
  },
];

export const PIE_RING = ["34 66", "22 78", "18 82", "26 74"];
export const PIE_COLORS = ["#f87171", "#60a5fa", "#fbbf24", "#a78bfa"];
export const PIE_OFF = ["0", "-34", "-56", "-74"];

export const getPie = (t) => [
  { c: "#f87171", name: t.cats.food, v: "34%" },
  { c: "#60a5fa", name: t.cats.move, v: "22%" },
  { c: "#fbbf24", name: t.cats.fun, v: "18%" },
  { c: "#a78bfa", name: t.cats.other, v: "26%" },
];
