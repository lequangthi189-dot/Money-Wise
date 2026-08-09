// Model: chuỗi đăng nhập và chuỗi ghi chép của người dùng.
// Hai bảng chỉ cho client đọc; chuỗi đăng nhập được cập nhật qua RPC của Lab 3.
import { supabase } from "./supabase";

export const CHUOI_RONG = {
  dangNhap: { current: 0, record: 0, status: "MAT_CHUOI" },
  ghiChep: { current: 0, record: 0, status: "BI_GIAN_DOAN" },
};

function toUI(row, fallbackStatus, dateField) {
  const lastDate = row?.[dateField] ?? null;
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const stillActive = !lastDate || lastDate >= yesterday.toISOString().slice(0, 10);
  return {
    current: stillActive ? (row?.so_ngay_hien_tai ?? 0) : 0,
    record: row?.ky_luc ?? 0,
    status: row?.trang_thai ?? fallbackStatus,
    lastDate,
  };
}

export async function fetchStreaks(userId) {
  const [loginResult, recordResult] = await Promise.all([
    supabase
      .from("chuoi_dang_nhap")
      .select("so_ngay_hien_tai, ky_luc, ngay_dang_nhap_gan_nhat, trang_thai")
      .eq("ma_nguoi_dung", userId)
      .maybeSingle(),
    supabase
      .from("chuoi_ghi_chep")
      .select("so_ngay_hien_tai, ky_luc, ngay_ghi_chep_gan_nhat, trang_thai")
      .eq("ma_nguoi_dung", userId)
      .maybeSingle(),
  ]);

  if (loginResult.error) throw loginResult.error;
  if (recordResult.error) throw recordResult.error;

  return {
    dangNhap: toUI(loginResult.data, "MAT_CHUOI", "ngay_dang_nhap_gan_nhat"),
    ghiChep: toUI(recordResult.data, "BI_GIAN_DOAN", "ngay_ghi_chep_gan_nhat"),
  };
}

export async function initializeRecordingStreak() {
  const { error } = await supabase.rpc("khoi_tao_chuoi_ghi_chep");
  if (error) throw error;
}
