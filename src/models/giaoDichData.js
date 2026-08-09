// Model: giao dịch lấy từ bảng giao_dich, kèm phương thức thanh toán.
// Xoá là xoá mềm qua RPC xoa_giao_dich (DB đã thu hồi quyền delete trực tiếp).
import { supabase } from "./supabase";
import { clsFor } from "./danhMucData";
import { fmtDayMonth, fmtSigned } from "./format";

const LOAI = { in: "THU", out: "CHI" };
const TYPE_FROM_LOAI = { THU: "in", CHI: "out" };
const varchar255 = (value) => String(value ?? "").trim().slice(0, 255) || null;
const textValue = (value) => String(value ?? "").trim() || null;

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
    createdTime: row.tao_luc
      ? new Date(row.tao_luc).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })
      : "",
  };
}

// RLS đã lọc theo người dùng và bỏ giao dịch đã xoá mềm.
export async function fetchTransactions(methods) {
  const methodsById = new Map(methods.map((m) => [m.id, m]));
  const { data, error } = await supabase
    .from("giao_dich")
    .select(
      "ma_giao_dich, ma_danh_muc, ma_phuong_thuc, loai_giao_dich, so_tien, ngay_giao_dich, noi_dung, tao_luc, danh_muc(ten_danh_muc, bieu_tuong)",
    )
    .order("ngay_giao_dich", { ascending: false })
    .order("ma_giao_dich", { ascending: false });

  if (error) throw error;
  return data.map((row) => toUI(row, methodsById));
}

// UC32: DB tra ve toi da mot danh muc tu lich su xac nhan cua chinh user.
export async function suggestTransactionCategory(text, type = "") {
  const { data, error } = await supabase.rpc("goi_y_danh_muc", {
    p_noi_dung: varchar255(text),
    p_loai_giao_dich: type === "in" ? "THU" : type === "out" ? "CHI" : null,
  });
  if (error) throw error;

  const suggestion = Array.isArray(data) ? data[0] : data;
  if (!suggestion?.ma_danh_muc || suggestion.de_xuat_tao_moi) return null;
  return {
    categoryId: suggestion.ma_danh_muc,
    categoryType: TYPE_FROM_LOAI[suggestion.loai_danh_muc] ?? "",
    source: suggestion.nguon_goi_y,
  };
}

export async function createTransaction({
  userId,
  categoryId,
  methodId,
  type,
  amount,
  date,
  note,
  source = "manual",
}) {
  const { data, error } = await supabase.from("giao_dich").insert({
    ma_nguoi_dung: userId,
    ma_danh_muc: categoryId,
    ma_phuong_thuc: methodId,
    loai_giao_dich: LOAI[type],
    so_tien: amount,
    ngay_giao_dich: date,
    noi_dung: textValue(note),
    nguon_tao: source === "chatbot" ? "CHATBOT" : "THU_CONG",
  }).select("ma_giao_dich").single();
  if (error) throw error;
  return data.ma_giao_dich;
}

export async function createTransactions(items) {
  const payload = items.map(({ userId, categoryId, methodId, type, amount, date, note }) => ({
    ma_nguoi_dung: userId,
    ma_danh_muc: categoryId,
    ma_phuong_thuc: methodId,
    loai_giao_dich: LOAI[type],
    so_tien: amount,
    ngay_giao_dich: date,
    noi_dung: textValue(note),
    nguon_tao: "CHATBOT",
  }));
  const { data, error } = await supabase.from("giao_dich").insert(payload).select("ma_giao_dich");
  if (error) throw error;
  return data.map((row) => row.ma_giao_dich);
}

export async function createChatAnalysis({ userId, text, amount, type, categoryId, date, methodId, question, status }) {
  const { data, error } = await supabase.from("phan_tich_chatbot").insert({
    ma_nguoi_dung: userId,
    noi_dung_nguoi_dung: varchar255(text),
    so_tien_goi_y: amount || null,
    loai_goi_y: type === "in" ? "THU" : type === "out" ? "CHI" : null,
    ma_danh_muc_goi_y: categoryId || null,
    ngay_goi_y: date || null,
    ma_phuong_thuc_goi_y: methodId || null,
    cau_hoi_bo_sung: varchar255(question),
    trang_thai: status,
  }).select("ma_phan_tich").single();
  if (error) throw error;
  return data.ma_phan_tich;
}

export async function updateChatAnalysis(analysisId, { amount, type, categoryId, date, methodId, question, status, transactionId = null }) {
  if (!analysisId) return;
  const payload = {
    so_tien_goi_y: amount || null,
    loai_goi_y: type === "in" ? "THU" : type === "out" ? "CHI" : null,
    ma_danh_muc_goi_y: categoryId || null,
    ngay_goi_y: date || null,
    ma_phuong_thuc_goi_y: methodId || null,
    cau_hoi_bo_sung: varchar255(question),
    trang_thai: status,
  };
  if (transactionId) {
    payload.ma_giao_dich = transactionId;
    payload.xac_nhan_luc = new Date().toISOString();
  }
  const { error } = await supabase.from("phan_tich_chatbot").update(payload).eq("ma_phan_tich", analysisId);
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
      noi_dung: textValue(note),
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

