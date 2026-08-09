import { supabase } from "./supabase";

export const DONUT_COLORS = ["#f87171", "#60a5fa", "#fbbf24", "#a78bfa", "#34d399", "#fb7185"];

async function refreshCurrentReport() {
  const { data, error } = await supabase.rpc("lam_moi_bao_cao_thang");
  if (error) throw error;
  return data;
}

export async function fetchMonthlyReports(userId) {
  await refreshCurrentReport(userId);
  const { data, error } = await supabase
    .from("bao_cao_thang")
    .select("ma_bao_cao, ky_thang, tong_thu, tong_chi, so_du")
    .order("ky_thang", { ascending: false })
    .limit(6);
  if (error) throw error;
  return data;
}

export async function fetchReportDetails(reportId) {
  if (!reportId) return [];
  const { data, error } = await supabase
    .from("chi_tiet_bao_cao_danh_muc")
    .select("tong_chi_danh_muc, ty_le_phan_tram, danh_muc(ten_danh_muc)")
    .eq("ma_bao_cao", reportId)
    .order("tong_chi_danh_muc", { ascending: false });
  if (error) throw error;
  return data;
}

export async function createShareCode(reportId) {
  const { data, error } = await supabase.rpc("tao_ma_chia_se_bao_cao", {
    p_ma_bao_cao: reportId,
  });
  if (error) throw error;
  return data;
}

export async function fetchSharedReport(code) {
  const normalizedCode = code.trim();
  if (!normalizedCode) return null;
  const { data, error } = await supabase.rpc("xem_bao_cao_qua_ma", {
    p_ma_chia_se: normalizedCode,
  });
  if (error) throw error;
  if (!data?.length) return null;
  const first = data[0];
  return {
    ky_thang: first.ky_thang,
    tong_thu: first.tong_thu,
    tong_chi: first.tong_chi,
    so_du: first.so_du,
    chi_tiet: data
      .filter((row) => row.ten_danh_muc)
      .map((row) => ({
        ten_danh_muc: row.ten_danh_muc,
        tong_chi_danh_muc: row.tong_chi_danh_muc,
        so_giao_dich: row.so_giao_dich,
        ty_le_phan_tram: row.ty_le_phan_tram,
      })),
  };
}
