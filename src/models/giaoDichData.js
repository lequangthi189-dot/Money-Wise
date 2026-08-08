// Model: giao dịch lấy từ bảng giao_dich, kèm phương thức thanh toán.
// Xoá là xoá mềm qua RPC xoa_giao_dich (DB đã thu hồi quyền delete trực tiếp).
import { supabase } from "./supabase";
import { clsFor } from "./danhMucData";
import { fmtDayMonth, fmtSigned } from "./format";

const LOAI = { in: "THU", out: "CHI" };
const TYPE_FROM_LOAI = { THU: "in", CHI: "out" };

// ma_hien_thi trong DB -> khoá trong i18n (t.methods).
const MKEY_FROM_MA = {
  TIEN_MAT: "cash",
  VI_DIEN_TU: "ewallet",
  THE: "card",
};

export async function fetchPaymentMethods() {
  const { data, error } = await supabase
    .from("phuong_thuc_thanh_toan")
    .select("ma_phuong_thuc, ma_hien_thi, ten_phuong_thuc")
    .eq("dang_hoat_dong", true)
    .order("thu_tu_hien_thi");

  if (error) throw error;
  return data.map((r) => ({
    id: r.ma_phuong_thuc,
    mkey: MKEY_FROM_MA[r.ma_hien_thi] ?? "cash",
    name: r.ten_phuong_thuc,
  }));
}

function toUI(row, methodsById) {
  const type = TYPE_FROM_LOAI[row.loai_giao_dich];
  const cat = row.danh_muc;
  return {
    id: row.ma_giao_dich,
    name: row.noi_dung || cat?.ten_danh_muc || "",
    type,
    amountRaw: Number(row.so_tien),
    amount: fmtSigned(row.so_tien, type),
    dateISO: row.ngay_giao_dich,
    date: fmtDayMonth(row.ngay_giao_dich),
    categoryId: row.ma_danh_muc,
    catName: cat?.ten_danh_muc ?? "",
    icon: cat?.bieu_tuong || "📌",
    cls: clsFor(row.ma_danh_muc),
    methodId: row.ma_phuong_thuc,
    mkey: methodsById.get(row.ma_phuong_thuc)?.mkey ?? "cash",
  };
}

// RLS đã lọc theo người dùng và bỏ giao dịch đã xoá mềm.
export async function fetchTransactions(methods) {
  const methodsById = new Map(methods.map((m) => [m.id, m]));
  const { data, error } = await supabase
    .from("giao_dich")
    .select(
      "ma_giao_dich, ma_danh_muc, ma_phuong_thuc, loai_giao_dich, so_tien, ngay_giao_dich, noi_dung, danh_muc(ten_danh_muc, bieu_tuong)",
    )
    .order("ngay_giao_dich", { ascending: false })
    .order("ma_giao_dich", { ascending: false });

  if (error) throw error;
  return data.map((row) => toUI(row, methodsById));
}

export async function createTransaction({
  userId,
  categoryId,
  methodId,
  type,
  amount,
  date,
  note,
}) {
  const { error } = await supabase.from("giao_dich").insert({
    ma_nguoi_dung: userId,
    ma_danh_muc: categoryId,
    ma_phuong_thuc: methodId,
    loai_giao_dich: LOAI[type],
    so_tien: amount,
    ngay_giao_dich: date,
    noi_dung: note?.trim() || null,
  });
  if (error) throw error;
}
export async function updateTransaction(id, {
  categoryId,
  methodId,
  type,
  amount,
  date,
  note,
}) {
  const { error } = await supabase
    .from("giao_dich")
    .update({
      ma_danh_muc: categoryId,
      ma_phuong_thuc: methodId,
      loai_giao_dich: LOAI[type],
      so_tien: amount,
      ngay_giao_dich: date,
      noi_dung: note?.trim() || null,
    })
    .eq("ma_giao_dich", id);
  if (error) throw error;
}

export async function deleteTransaction(id) {
  const { error } = await supabase.rpc("xoa_giao_dich", {
    p_ma_giao_dich: id,
  });
  if (error) throw error;
}
export async function fetchLearnedCategory(keywords, type) {
  if (!keywords.length) return null;
  const { data, error } = await supabase.rpc("goi_y_danh_muc_uc32", {
    p_tu_khoa: keywords,
    p_loai_giao_dich: LOAI[type] ?? null,
  });
  if (error) throw error;
  return data;
}

export async function recordCategorySuggestion({ content, keywords, suggestedCategoryId, confirmedCategoryId }) {
  const { error } = await supabase.rpc("ghi_nhan_goi_y_danh_muc_uc32", {
    p_noi_dung: content.trim().slice(0, 255),
    p_tu_khoa: keywords,
    p_ma_danh_muc_goi_y: suggestedCategoryId || null,
    p_ma_danh_muc_xac_nhan: confirmedCategoryId,
  });
  if (error) throw error;
}

