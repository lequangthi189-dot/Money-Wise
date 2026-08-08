// Model: danh mục thu/chi lấy từ bảng danh_muc.
// DB dùng 'THU'/'CHI', UI dùng 'in'/'out' — quy đổi tập trung ở đây.
import { supabase } from "./supabase";

export const LOAI = { in: "THU", out: "CHI" };
const TYPE_FROM_LOAI = { THU: "in", CHI: "out" };

// Bộ icon cho form thêm danh mục (giữ nguyên như bản mock).
export const CATEGORY_ICONS = [
  "🍜", "🛵", "📚", "🏠", "🎮", "🛍️", "☕", "❤️", "💰",
  "🎓", "🐶", "🎵", "✈️", "💻", "🎁", "📌", "👨‍👩‍👧",
];

// DB không lưu class màu. Chọn theo id để mỗi danh mục luôn ra cùng một màu.
const CLS_PALETTE = [
  "c-food", "c-move", "c-edu", "c-rent",
  "c-fun", "c-shop", "c-coffee", "c-health", "c-salary",
];

// Các bản ghi mặc định cũ trong DB chưa có bieu_tuong. Giữ icon gốc theo
// ma_danh_muc thay vì hiển thị tất cả thành icon fallback 📌.
const DEFAULT_ICONS = {
  1: "🍜",
  2: "🛵",
  3: "📚",
  4: "🏠",
  5: "🎮",
  6: "🛍️",
  7: "☕",
  8: "❤️",
  9: "💰",
  10: "👨‍👩‍👧",
  11: "🎓",
};

export function clsFor(id) {
  return CLS_PALETTE[Number(id) % CLS_PALETTE.length];
}

function toUI(row) {
  return {
    id: row.ma_danh_muc,
    name: row.ten_danh_muc,
    icon: row.bieu_tuong || DEFAULT_ICONS[row.ma_danh_muc] || "📌",
    cls: clsFor(row.ma_danh_muc),
    type: TYPE_FROM_LOAI[row.loai_danh_muc],
    isDefault: row.la_mac_dinh,
    active: row.dang_hoat_dong,
  };
}

// Danh mục mặc định (ma_nguoi_dung is null) + danh mục riêng của user;
// RLS đã lọc sẵn nên không cần điều kiện ma_nguoi_dung ở đây.
export async function fetchCategories() {
  const { data, error } = await supabase
    .from("danh_muc")
    .select("ma_danh_muc, ten_danh_muc, loai_danh_muc, bieu_tuong, la_mac_dinh, dang_hoat_dong")
    .eq("dang_hoat_dong", true)
    .order("la_mac_dinh", { ascending: false })
    .order("ma_danh_muc");

  if (error) throw error;
  return data.map(toUI);
}

export async function createCategory({ userId, name, type, icon }) {
  const { data, error } = await supabase
    .from("danh_muc")
    .insert({
      ma_nguoi_dung: userId,
      ten_danh_muc: name.trim(),
      loai_danh_muc: LOAI[type],
      bieu_tuong: icon,
      dang_hoat_dong: true,
      la_mac_dinh: false,
    })
    .select("ma_danh_muc, ten_danh_muc, loai_danh_muc, bieu_tuong, la_mac_dinh, dang_hoat_dong")
    .single();

  if (error) throw error;
  return toUI(data);
}

// Không đổi được loai_danh_muc sau khi tạo (trigger kiem_tra_danh_muc chặn).
export async function updateCategory(id, { name, icon }) {
  const { data, error } = await supabase
    .from("danh_muc")
    .update({ ten_danh_muc: name.trim(), bieu_tuong: icon })
    .eq("ma_danh_muc", id)
    .select("ma_danh_muc, ten_danh_muc, loai_danh_muc, bieu_tuong, la_mac_dinh, dang_hoat_dong")
    .single();

  if (error) throw error;
  return toUI(data);
}
export async function canDeleteCategory(id) {
  const { data, error } = await supabase.rpc("danh_muc_xoa_duoc", {
    p_ma_danh_muc: id,
  });
  if (error) throw error;
  return data === true;
}

export async function deleteCategory(id) {
  const { error } = await supabase
    .from("danh_muc")
    .delete()
    .eq("ma_danh_muc", id);
  if (error) throw error;
}

// Danh mục đã có dữ liệu chỉ được ẩn để giữ nguyên lịch sử giao dịch.
export async function hideCategory(id) {
  const { error } = await supabase
    .from("danh_muc")
    .update({ dang_hoat_dong: false })
    .eq("ma_danh_muc", id);
  if (error) throw error;
}

