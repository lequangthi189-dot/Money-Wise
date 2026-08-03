// Model: chuỗi ngày của người dùng.
// - chuoi_ghi_chep: chuỗi ngày CÓ GHI GIAO DỊCH, do trigger trên giao_dich tính.
// - chuoi_dang_nhap: chuỗi ngày ĐĂNG NHẬP, do RPC cap_nhat_chuoi_dang_nhap tính.
// Cả hai bảng đều chỉ cho đọc (quyền ghi đã bị thu hồi), nên ở đây chỉ select.
import { supabase } from "./supabase";

export const CHUOI_RONG = {
  ghiChep: { current: 0, record: 0, status: "BI_GIAN_DOAN" },
  dangNhap: { current: 0, record: 0, status: "MAT_CHUOI" },
};

function toUI(row, trangThaiMacDinh) {
  return {
    current: row?.so_ngay_hien_tai ?? 0,
    record: row?.ky_luc ?? 0,
    status: row?.trang_thai ?? trangThaiMacDinh,
  };
}

export async function fetchStreaks(userId) {
  const cols = "so_ngay_hien_tai, ky_luc, trang_thai";
  const [ghiChep, dangNhap] = await Promise.all([
    supabase
      .from("chuoi_ghi_chep")
      .select(cols)
      .eq("ma_nguoi_dung", userId)
      .maybeSingle(),
    supabase
      .from("chuoi_dang_nhap")
      .select(cols)
      .eq("ma_nguoi_dung", userId)
      .maybeSingle(),
  ]);

  if (ghiChep.error) throw ghiChep.error;
  if (dangNhap.error) throw dangNhap.error;

  return {
    ghiChep: toUI(ghiChep.data, "BI_GIAN_DOAN"),
    dangNhap: toUI(dangNhap.data, "MAT_CHUOI"),
  };
}
