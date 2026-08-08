import { supabase } from "./supabase";

// Model: dữ liệu hạn mức lấy và lưu trực tiếp trên Supabase.

const monthStart = () => new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().slice(0, 10);
const nextMonthStart = () => new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1).toISOString().slice(0, 10);

async function fetchMonthlySpending() {
  const { data, error } = await supabase
    .from("giao_dich")
    .select("ma_danh_muc, so_tien")
    .eq("loai_giao_dich", "CHI")
    .gte("ngay_giao_dich", monthStart())
    .lt("ngay_giao_dich", nextMonthStart());
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

function progressFields(limit, spent) {
  const percent = limit > 0 ? Math.round((spent / limit) * 10000) / 100 : 0;
  return {
    tong_da_chi: spent,
    phan_tram_da_dung: percent,
    so_tien_con_lai: limit - spent,
    trang_thai_canh_bao: percent >= 100 ? "VUOT_HAN_MUC" : percent >= 80 ? "SAP_DAT" : "BINH_THUONG",
  };
}

export async function fetchBudgetState() {
  const { data: total, error } = await supabase
    .from("han_muc_thang")
    .select("ma_han_muc_thang, so_tien_han_muc, tong_da_chi")
    .eq("ky_thang", monthStart())
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

export async function saveBudgetLimit(userId, type, categoryId, amount) {
  const month = monthStart();
  const spending = await fetchMonthlySpending();
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
      ...progressFields(amount, spending.total),
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
      ...progressFields(amount, categorySpent),
    };
    const result = await supabase.from("han_muc_danh_muc").upsert(payload, { onConflict: "ma_han_muc_thang,ma_danh_muc" });
    if (result.error) throw result.error;
    const refreshedTotal = await supabase
      .from("han_muc_thang")
      .update(progressFields(Number(total.so_tien_han_muc), spending.total))
      .eq("ma_han_muc_thang", total.ma_han_muc_thang);
    if (refreshedTotal.error) throw refreshedTotal.error;
  }
  return fetchBudgetState();
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

function toBudgetRow(category, savedLimit) {
  const total = Number(savedLimit?.tot ?? 0);
  const current = Number(savedLimit?.cur ?? 0);
  const pct = total > 0 ? Math.round((current / total) * 100) : 0;
  const isAtLimit = pct >= 100;
  const isWarning = pct >= 80 && pct < 100;

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

export function getBudgetRows(t, categories = [], budgetState = null) {
  void t;
  const state = normalizeBudgetState(budgetState);
  if (!Array.isArray(categories) || categories.length === 0) return [];

  const expenseCategories = categories.filter((category) => category?.type === "out");
  return expenseCategories.map((category) => {
    const saved = state.categoryLimits[String(category.id)];
    return toBudgetRow(category, saved);
  });
}
