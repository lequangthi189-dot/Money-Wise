// "Cơ sở dữ liệu" giả lập cho MoneyWise.
// Toàn bộ hàm export đều trả về Promise + có độ trễ giả lập (như gọi API thật).
// => Sau này nối backend thật, chỉ cần thay NỘI DUNG bên trong các hàm ở
//    categoryService/budgetService/transactionService/goalService/settingsService
//    (gọi fetch/axios tới server) mà KHÔNG cần sửa Context hay các hook/UI.

const DB_KEY = "moneywise_mock_db";
const DELAY_MS = 350;

const delay = (value) =>
  new Promise((resolve) => setTimeout(() => resolve(value), DELAY_MS));

const clone = (v) => JSON.parse(JSON.stringify(v));

const SEED = {
  categories: [
    { id: 1, key: "food", icon: "🍜", cls: "c-food", type: "out" },
    { id: 2, key: "move", icon: "🛵", cls: "c-move", type: "out" },
    { id: 3, key: "edu", icon: "📚", cls: "c-edu", type: "out" },
    { id: 4, key: "rent", icon: "🏠", cls: "c-rent", type: "out" },
    { id: 5, key: "fun", icon: "🎮", cls: "c-fun", type: "out" },
    { id: 6, key: "shop", icon: "🛍️", cls: "c-shop", type: "out" },
    { id: 7, key: "coffee", icon: "☕", cls: "c-coffee", type: "out" },
    { id: 8, key: "health", icon: "❤️", cls: "c-health", type: "out" },
    { id: 9, key: "salary", icon: "💰", cls: "c-salary", type: "in" },
    { id: 10, key: "family", icon: "👨‍👩‍👧", cls: "c-salary", type: "in" },
    { id: 11, key: "scholar", icon: "🎓", cls: "c-salary", type: "in" },
  ],
  budgets: [
    { categoryId: "TOTAL", limit: 4000000 },
    { categoryId: 7, limit: 350000 },
    { categoryId: 1, limit: 1000000 },
    { categoryId: 5, limit: 400000 },
    { categoryId: 2, limit: 600000 },
    { categoryId: 6, limit: 500000 },
  ],
  transactions: [
    { id: 1, categoryId: 7, type: "out", amount: 35000, note: "Trà sữa Phúc Long", daysAgo: 0, time: "14:20", method: "ewallet" },
    { id: 2, categoryId: 7, type: "out", amount: 270000, note: "Cà phê trong tháng", daysAgo: 3, method: "cash" },
    { id: 3, categoryId: 1, type: "out", amount: 45000, note: "Cơm trưa", daysAgo: 0, time: "12:05", method: "cash" },
    { id: 4, categoryId: 1, type: "out", amount: 696000, note: "Ăn uống trong tháng", daysAgo: 5, method: "cash" },
    { id: 5, categoryId: 2, type: "out", amount: 65000, note: "Đổ xăng", daysAgo: 0, time: "08:30", method: "cash" },
    { id: 6, categoryId: 2, type: "out", amount: 415000, note: "Di chuyển trong tháng", daysAgo: 4, method: "ewallet" },
    { id: 7, categoryId: 5, type: "out", amount: 392000, note: "Giải trí trong tháng", daysAgo: 6, method: "ewallet" },
    { id: 8, categoryId: 6, type: "out", amount: 120000, note: "Mua sắm trong tháng", daysAgo: 2, method: "transfer" },
    { id: 9, categoryId: 9, type: "in", amount: 1500000, note: "Lương làm thêm", daysAgo: 1, method: "transfer" },
  ],
  goals: [
    { id: 1, key: "phone", icon: "📱", cur: 9200000, tot: 15000000 },
    { id: 2, key: "trip", icon: "✈️", cur: 3100000, tot: 5000000 },
    { id: 3, key: "laptop", icon: "💻", cur: 4000000, tot: 25000000 },
  ],
  settings: {
    balance: 4250000,
    streak: 12,
    streakRecord: 18,
  },
};

function loadDb() {
  try {
    const raw = localStorage.getItem(DB_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {}
  return clone(SEED);
}

let db = loadDb();

function persist() {
  try {
    localStorage.setItem(DB_KEY, JSON.stringify(db));
  } catch (e) {}
}

let nextCategoryId =
  db.categories.reduce((max, c) => Math.max(max, c.id), 0) + 1;
let nextTransactionId =
  db.transactions.reduce((max, t) => Math.max(max, t.id), 0) + 1;

export function getCategories() {
  return delay(clone(db.categories));
}

export function addCategory({ name, type, icon }) {
  const row = {
    id: nextCategoryId++,
    key: null,
    name,
    icon,
    cls: "c-custom",
    type,
  };
  db.categories.push(row);
  persist();
  return delay(clone(row));
}

export function updateCategory(id, patch) {
  const row = db.categories.find((c) => c.id === id);
  if (row) Object.assign(row, patch);
  persist();
  return delay(row ? clone(row) : null);
}

export function deleteCategory(id) {
  db.categories = db.categories.filter((c) => c.id !== id);
  db.budgets = db.budgets.filter((b) => b.categoryId !== id);
  persist();
  return delay({ id });
}

export function getBudgets() {
  return delay(clone(db.budgets));
}

export function setCategoryBudget(categoryId, limit) {
  const row = db.budgets.find((b) => b.categoryId === categoryId);
  if (row) row.limit = limit;
  else db.budgets.push({ categoryId, limit });
  persist();
  return delay(clone(db.budgets));
}

export function deleteBudget(categoryId) {
  db.budgets = db.budgets.filter((b) => b.categoryId !== categoryId);
  persist();
  return delay(clone(db.budgets));
}

export function getTransactions() {
  return delay(clone(db.transactions));
}

export function addTransaction(tx) {
  const row = { id: nextTransactionId++, daysAgo: 0, ...tx };
  db.transactions.push(row);
  persist();
  return delay(clone(row));
}

export function getGoals() {
  return delay(clone(db.goals));
}

export function getSettings() {
  return delay(clone(db.settings));
}