import { supabase } from "./supabase";

const SELECT_GOAL = "ma_muc_tieu, ten_muc_tieu, so_tien_muc_tieu, so_du_ban_dau, lai_suat, don_vi_lai_suat, gop_du_kien_moi_ky, goc_da_tich_luy, lai_tich_luy, tong_so_du_thuc_te, phan_tram_tien_do, so_ky_con_lai, ngay_du_kien_dat, trang_thai";

export async function fetchGoals() {
  const { data, error } = await supabase
    .from("muc_tieu_tiet_kiem")
    .select(SELECT_GOAL)
    .order("cap_nhat_luc", { ascending: false });
  if (error) throw error;
  return data;
}

export async function createGoal(userId, form) {
  const initial = Number(form.initial) || 0;
  const target = Number(form.target);
  const { data, error } = await supabase
    .from("muc_tieu_tiet_kiem")
    .insert({
      ma_nguoi_dung: userId,
      ten_muc_tieu: form.name.trim(),
      so_tien_muc_tieu: target,
      so_du_ban_dau: initial,
      lai_suat: Number(form.rate) || 0,
      don_vi_lai_suat: form.unit,
      gop_du_kien_moi_ky: Number(form.monthly) || 0,
      ngay_bat_dau: new Date().toISOString().slice(0, 10),
      goc_da_tich_luy: initial,
      lai_tich_luy: 0,
      tong_so_du_thuc_te: initial,
      phan_tram_tien_do: Math.round((initial / target) * 10000) / 100,
      trang_thai: initial >= target ? "HOAN_THANH" : "DANG_THUC_HIEN",
    })
    .select(SELECT_GOAL)
    .single();
  if (error) throw error;
  const { data: refreshed, error: refreshError } = await supabase
    .from("muc_tieu_tiet_kiem").select(SELECT_GOAL)
    .eq("ma_muc_tieu", data.ma_muc_tieu).single();
  if (refreshError) throw refreshError;
  return refreshed;
}

export function forecastGoal(goal) {
  const target = Number(goal.so_tien_muc_tieu);
  const current = Number(goal.tong_so_du_thuc_te ?? goal.so_du_ban_dau ?? 0);
  const contribution = Number(goal.gop_du_kien_moi_ky ?? 0);
  const rate = Number(goal.lai_suat ?? 0) / 100;
  const periodRate = goal.don_vi_lai_suat === "NAM" ? rate / 12 : rate;
  let balance = current;
  let periods = 0;
  while (balance < target && periods < 1200 && (contribution > 0 || periodRate > 0)) {
    balance = balance * (1 + periodRate) + contribution;
    periods += 1;
  }
  const date = balance >= target ? new Date(new Date().setMonth(new Date().getMonth() + periods)) : null;
  return { periods: balance >= target ? periods : null, date };
}

export async function updateGoal(goalId, form) {
  const { error } = await supabase.from("muc_tieu_tiet_kiem").update({
    ten_muc_tieu: form.name.trim(),
    so_tien_muc_tieu: Number(form.target),
    lai_suat: Number(form.rate) || 0,
    don_vi_lai_suat: form.unit,
    gop_du_kien_moi_ky: Number(form.monthly) || 0,
    cap_nhat_luc: new Date().toISOString(),
  }).eq("ma_muc_tieu", goalId);
  if (error) throw error;
  const { data, error: fetchError } = await supabase
    .from("muc_tieu_tiet_kiem").select(SELECT_GOAL)
    .eq("ma_muc_tieu", goalId).single();
  if (fetchError) throw fetchError;
  return data;
}

export async function fetchInterestSchedule(goalId) {
  const { data, error } = await supabase.from("ky_tich_luy_muc_tieu")
    .select("so_thu_tu_ky, so_du_dau_ky, so_tien_trong_ky, lai_phat_sinh, lai_tich_luy, tong_cuoi_ky")
    .eq("ma_muc_tieu", goalId).order("so_thu_tu_ky");
  if (error) throw error;
  return data;
}

export async function fetchGoalContributions(goalId) {
  if (!goalId) return [];
  const { data, error } = await supabase
    .from("dong_gop_muc_tieu")
    .select("ma_dong_gop, so_tien, ngay_dong_gop, ghi_chu")
    .eq("ma_muc_tieu", goalId)
    .order("ngay_dong_gop", { ascending: false })
    .order("ma_dong_gop", { ascending: false });
  if (error) throw error;
  return data;
}

export async function addGoalContribution(goalId, { amount, date, note }) {
  const { error } = await supabase.from("dong_gop_muc_tieu").insert({
    ma_muc_tieu: goalId,
    so_tien: Number(amount),
    ngay_dong_gop: date,
    ghi_chu: note.trim() || null,
  });
  if (error) throw error;

  const { data, error: goalError } = await supabase
    .from("muc_tieu_tiet_kiem")
    .select(SELECT_GOAL)
    .eq("ma_muc_tieu", goalId)
    .single();
  if (goalError) throw goalError;
  return data;
}
