// Model: dữ liệu Hạn mức. Giá trị khởi tạo + danh sách hạn mức theo danh mục.
export const INITIAL_TOTAL_LIMIT = 4000000;
export const INITIAL_TOTAL_SPENT = 2180000;

export const getBudgetRows = (t) => [
  {
    icon: "☕",
    cls: "c-coffee",
    name: t.cats.coffee,
    cur: "305.000",
    tot: "350.000",
    pct: 86,
    bar: "warn",
    badge: "b-warn",
  },
  {
    icon: "🍜",
    cls: "c-food",
    name: t.cats.food,
    cur: "741.000",
    tot: "1.000.000",
    pct: 74,
    bar: "",
    badge: "dim",
  },
  {
    icon: "🎮",
    cls: "c-fun",
    name: t.cats.fun,
    cur: "392.000",
    tot: "400.000",
    pct: 98,
    bar: "danger",
    badge: "b-out",
  },
  {
    icon: "🛵",
    cls: "c-move",
    name: t.cats.move,
    cur: "480.000",
    tot: "600.000",
    pct: 80,
    bar: "warn",
    badge: "dim",
  },
  {
    icon: "🛍️",
    cls: "c-shop",
    name: t.cats.shop,
    cur: "120.000",
    tot: "500.000",
    pct: 24,
    bar: "ok",
    badge: "b-in",
  },
];
