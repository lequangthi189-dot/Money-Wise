import { supabase } from "./supabase";

// Model: dữ liệu hạn mức lấy và lưu trực tiếp trên Supabase.

const formatMonthStart = (date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-01`;
const monthStart = () => formatMonthStart(new Date());
const normalizeMonthStart = (value) => /^\d{4}-\d{2}(?:-01)?$/.test(value ?? "")
  ? `${String(value).slice(0, 7)}-01`
  : monthStart();
const nextMonthStart = (value) => {
  const current = normalizeMonthStart(value);
  const date = new Date(`${current}T00:00:00`);
  date.setMonth(date.getMonth() + 1);
  return formatMonthStart(date);
};

async function fetchMonthlySpending(selectedMonth) {
  const month = normalizeMonthStart(selectedMonth);
  const { data, error } = await supabase
    .from("giao_dich")
    .select("ma_danh_muc, so_tien")
    .eq("loai_giao_dich", "CHI")
    .gte("ngay_giao_dich", month)
    .lt("ngay_giao_dich", nextMonthStart(month));
  if (error) throw error;
  const byCategory = {};
  let total = 0;
  data.forEach((transaction) => {
    const amount = Number(transaction.so_tien);
    total += amount;
    byCategory[transaction.ma_danh_muc] = (byCategory[transaction.ma_danh_muc] || 0) + amount;
  });
  return { total, byCategory };
}

export async function fetchBudgetConfig() {
  const { data, error } = await supabase
    .from("tham_so")
    .select("ma_tham_so, gia_tri")
    .in("ma_tham_so", ["TS03", "TS04"]);
  if (error) throw error;
  const values = Object.fromEntries(data.map((row) => [row.ma_tham_so, Number(row.gia_tri)]));
  const warning = values.TS03;
  const danger = values.TS04;
  if (!Number.isFinite(warning) || !Number.isFinite(danger)) throw new Error("Thiếu cấu hình ngưỡng hạn mức trong DB.");
  return { warning, danger };
}

function progressFields(limit, spent, config) {
  const percent = limit > 0 ? Math.round((spent / limit) * 10000) / 100 : 0;
  return {
    tong_da_chi: spent,
    phan_tram_da_dung: percent,
    so_tien_con_lai: limit - spent,
    trang_thai_canh_bao: percent >= config.danger ? "VUOT_HAN_MUC" : percent >= config.warning ? "SAP_DAT" : "BINH_THUONG",
  };
}

export async function fetchBudgetState(selectedMonth = monthStart()) {
  const month = normalizeMonthStart(selectedMonth);
  const { data: total, error } = await supabase
    .from("han_muc_thang")
    .select("ma_han_muc_thang, so_tien_han_muc, tong_da_chi")
    .eq("ky_thang", month)
    .maybeSingle();
  if (error) throw error;
  if (!total) return { totalLimit: 0, totalSpent: 0, categoryLimits: {} };
  const { data: rows, error: childError } = await supabase
    .from("han_muc_danh_muc")
    .select("ma_danh_muc, so_tien_han_muc, tong_da_chi")
    .eq("ma_han_muc_thang", total.ma_han_muc_thang);
  if (childError) throw childError;
  return {
    totalLimit: Number(total.so_tien_han_muc),
    totalSpent: Number(total.tong_da_chi),
    categoryLimits: Object.fromEntries(rows.map((row) => [String(row.ma_danh_muc), { tot: Number(row.so_tien_han_muc), cur: Number(row.tong_da_chi) }])),
  };
}

export async function saveBudgetLimit(userId, type, categoryId, amount, selectedMonth = monthStart()) {
  const config = await fetchBudgetConfig();
  const month = normalizeMonthStart(selectedMonth);
  const spending = await fetchMonthlySpending(month);
  let { data: total, error } = await supabase
    .from("han_muc_thang")
    .select("ma_han_muc_thang, so_tien_han_muc")
    .eq("ky_thang", month)
    .maybeSingle();
  if (error) throw error;
  if (type === "total") {
    const payload = {
      ma_nguoi_dung: userId,
      ky_thang: month,
      so_tien_han_muc: amount,
      ...progressFields(amount, spending.total, config),
    };
    const result = await supabase.from("han_muc_thang").upsert(payload, { onConflict: "ma_nguoi_dung,ky_thang" });
    if (result.error) throw result.error;
  } else {
    if (!total) throw new Error("Hãy đặt hạn mức tổng tháng trước.");
    const categorySpent = spending.byCategory[Number(categoryId)] || 0;
    const payload = {
      ma_han_muc_thang: total.ma_han_muc_thang,
      ma_danh_muc: Number(categoryId),
      so_tien_han_muc: amount,
      ...progressFields(amount, categorySpent, config),
    };
    const result = await supabase.from("han_muc_danh_muc").upsert(payload, { onConflict: "ma_han_muc_thang,ma_danh_muc" });
    if (result.error) throw result.error;
    const refreshedTotal = await supabase
      .from("han_muc_thang")
      .update(progressFields(Number(total.so_tien_han_muc), spending.total, config))
      .eq("ma_han_muc_thang", total.ma_han_muc_thang);
    if (refreshedTotal.error) throw refreshedTotal.error;
  }
  return fetchBudgetState(month);
}

function normalizeBudgetState(value) {
  if (!value || typeof value !== "object") return { totalLimit: 0, totalSpent: 0, categoryLimits: {} };
  return {
    totalLimit: Number(value.totalLimit) || 0,
    totalSpent: Number(value.totalSpent) || 0,
    categoryLimits: value.categoryLimits && typeof value.categoryLimits === "object"
      ? value.categoryLimits
      : {},
  };
}

function toBudgetRow(category, savedLimit, config) {
  const total = Number(savedLimit?.tot ?? 0);
  const current = Number(savedLimit?.cur ?? 0);
  const pct = total > 0 ? Math.round((current / total) * 100) : 0;
  const isAtLimit = pct >= config.danger;
  const isWarning = pct >= config.warning && pct < config.danger;

  return {
    id: category.id,
    icon: category.icon || "📌",
    cls: category.cls || "c-default",
    catKey: String(category.id),
    name: category.name,
    cur: current,
    tot: total,
    pct,
    bar: isAtLimit ? "danger" : isWarning ? "warn" : "",
    badge: isAtLimit ? "b-out" : isWarning ? "b-warn" : "dim",
  };
}

export function getBudgetRows(t, categories = [], budgetState = null, config = null) {
  void t;
  const state = normalizeBudgetState(budgetState);
  if (!Array.isArray(categories) || categories.length === 0 || !config) return [];

  const expenseCategories = categories.filter((category) => category?.type === "out");
  return expenseCategories.map((category) => {
    const saved = state.categoryLimits[String(category.id)];
    return toBudgetRow(category, saved, config);
  });
}
