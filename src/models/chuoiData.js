// Model: chuỗi ngày ghi chép của người dùng.
// chuoi_ghi_chep: chuỗi ngày CÓ GHI GIAO DỊCH, do trigger trên giao_dich tính.
// Bảng chỉ cho đọc (quyền ghi đã bị thu hồi), nên ở đây chỉ select.
import { supabase } from "./supabase";

export const CHUOI_RONG = {
  ghiChep: { current: 0, record: 0, status: "BI_GIAN_DOAN" },
};

function toUI(row) {
  return {
    current: row?.so_ngay_hien_tai ?? 0,
    record: row?.ky_luc ?? 0,
    status: row?.trang_thai ?? "BI_GIAN_DOAN",
  };
}

export async function fetchStreaks(userId) {
  const { data, error } = await supabase
    .from("chuoi_ghi_chep")
    .select("so_ngay_hien_tai, ky_luc, trang_thai")
    .eq("ma_nguoi_dung", userId)
    .maybeSingle();

  if (error) throw error;

  return { ghiChep: toUI(data) };
}
