// Model: dữ liệu Hạn mức. Giá trị khởi tạo + danh sách hạn mức theo danh mục.
// Nếu có danh mục chi thật từ Supabase thì budget sẽ tự động tạo hàng tương ứng.
export const INITIAL_TOTAL_LIMIT = 4000000;
export const INITIAL_TOTAL_SPENT = 2180000;
export const BUDGET_STORAGE_KEY = "moneywise-budget-state";

const DEFAULT_BUDGET_ROWS = [
  {
    id: 1,
    icon: "☕",
    cls: "c-coffee",
    catKey: "coffee",
    name: "Coffee",
    cur: 305000,
    tot: 350000,
    pct: 86,
    bar: "warn",
    badge: "b-warn",
  },
  {
    id: 2,
    icon: "🍜",
    cls: "c-food",
    catKey: "food",
    name: "Food",
    cur: 741000,
    tot: 1000000,
    pct: 74,
    bar: "",
    badge: "dim",
  },
  {
    id: 3,
    icon: "🎮",
    cls: "c-fun",
    catKey: "fun",
    name: "Fun",
    cur: 392000,
    tot: 400000,
    pct: 98,
    bar: "danger",
    badge: "b-out",
  },
  {
    id: 4,
    icon: "🛵",
    cls: "c-move",
    catKey: "move",
    name: "Move",
    cur: 480000,
    tot: 600000,
    pct: 80,
    bar: "warn",
    badge: "dim",
  },
  {
    id: 5,
    icon: "🛍️",
    cls: "c-shop",
    catKey: "shop",
    name: "Shop",
    cur: 120000,
    tot: 500000,
    pct: 24,
    bar: "ok",
    badge: "b-in",
  },
];

function createDefaultBudgetState() {
  return {
    totalLimit: INITIAL_TOTAL_LIMIT,
    totalSpent: INITIAL_TOTAL_SPENT,
    categoryLimits: {},
  };
}

function normalizeBudgetState(value) {
  const base = createDefaultBudgetState();
  if (!value || typeof value !== "object") return base;
  return {
    totalLimit: Number(value.totalLimit) || base.totalLimit,
    totalSpent: Number(value.totalSpent) || base.totalSpent,
    categoryLimits: value.categoryLimits && typeof value.categoryLimits === "object"
      ? value.categoryLimits
      : {},
  };
}

export function readBudgetState() {
  if (typeof window === "undefined") return createDefaultBudgetState();

  try {
    const raw = window.localStorage.getItem(BUDGET_STORAGE_KEY);
    if (!raw) return createDefaultBudgetState();
    return normalizeBudgetState(JSON.parse(raw));
  } catch {
    return createDefaultBudgetState();
  }
}

export function writeBudgetState(nextState) {
  const state = normalizeBudgetState(nextState);
  if (typeof window !== "undefined") {
    window.localStorage.setItem(BUDGET_STORAGE_KEY, JSON.stringify(state));
  }
  return state;
}

function toBudgetRow(t, category, fallback = null, savedLimit = null) {
  const fallbackName = fallback?.name ?? "Danh mục";
  const name = category?.name || fallbackName;
  const catKey = String(category?.id ?? category?.name?.toLowerCase().replace(/\s+/g, "-") ?? fallback?.catKey ?? "custom");
  const total = Number(savedLimit?.tot ?? fallback?.tot ?? 0);
  const current = Number(savedLimit?.cur ?? fallback?.cur ?? 0);
  const pct = total > 0 ? Math.round((current / total) * 100) : fallback?.pct ?? 0;
  const isAtLimit = pct >= 100;
  const isWarning = pct >= 80 && pct < 100;

  return {
    id: category?.id ?? fallback?.id ?? catKey,
    icon: category?.icon || fallback?.icon || "📌",
    cls: category?.cls || fallback?.cls || "c-default",
    catKey,
    name: t?.cats?.[fallback?.catKey] || name,
    cur: current,
    tot: total,
    pct,
    bar: isAtLimit ? "danger" : isWarning ? "warn" : "",
    badge: isAtLimit ? "b-out" : isWarning ? "b-warn" : "dim",
  };
}

export function getBudgetRows(t, categories = [], budgetState = null) {
  const state = normalizeBudgetState(budgetState ?? readBudgetState());

  if (!Array.isArray(categories) || categories.length === 0) {
    return DEFAULT_BUDGET_ROWS.map((row) => ({
      ...row,
      name: t?.cats?.[row.catKey] || row.name,
    }));
  }

  const expenseCategories = categories.filter((category) => category?.type === "out");
  if (expenseCategories.length === 0) {
    return DEFAULT_BUDGET_ROWS.map((row) => ({
      ...row,
      name: t?.cats?.[row.catKey] || row.name,
    }));
  }

  return expenseCategories.map((category) => {
    const fallback = DEFAULT_BUDGET_ROWS.find((row) => row.catKey === category?.name?.toLowerCase());
    const saved = state.categoryLimits[String(category.id)] ?? state.categoryLimits[String(category.name).toLowerCase()];
    return toBudgetRow(t, category, fallback, saved);
  });
}