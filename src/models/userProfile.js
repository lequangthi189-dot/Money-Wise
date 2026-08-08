// Model: đọc hồ sơ người dùng từ bảng nguoi_dung và quy đổi sang shape mà
// các controller/view đang dùng. DB đặt tên cột tiếng Việt và mã viết hoa
// ('ADMIN'/'USER', 'HOAT_DONG'/'DA_KHOA'), app dùng ROLES ('admin'/'user').
import { supabase } from "./supabase";
import { ROLES } from "./constants";

const VAI_TRO_TO_ROLE = {
  ADMIN: ROLES.ADMIN,
  USER: ROLES.USER,
};

export const TRANG_THAI = {
  HOAT_DONG: "HOAT_DONG",
  DA_KHOA: "DA_KHOA",
};

// Các khoá metadata mà trigger tao_ho_so_nguoi_dung đọc từ raw_user_meta_data.
// Sai tên khoá thì insert vào nguoi_dung vi phạm NOT NULL và signUp sẽ hỏng.
export function toSignUpMetadata({ name, username, phone }) {
  return {
    ho_ten: name,
    ten_dang_nhap: username,
    so_dien_thoai: phone,
  };
}

// Bỏ khoảng trắng/dấu ngăn cách để khớp check '^\+?[0-9]{9,15}$' của DB.
export function normalizePhone(phone) {
  return (phone || "").replace(/[\s.\-()]/g, "");
}

export function isValidPhone(phone) {
  return /^\+?[0-9]{9,15}$/.test(normalizePhone(phone));
}

export async function fetchUserProfile(userId) {
  const { data, error } = await supabase
    .from("nguoi_dung")
    .select(
      "ma_nguoi_dung, ma_vai_tro, email, ho_ten, ten_dang_nhap, so_dien_thoai, anh_dai_dien_url, trang_thai, ngay_tham_gia",
    )
    .eq("ma_nguoi_dung", userId)
    .single();

  if (error) throw error;

  return {
    id: data.ma_nguoi_dung,
    email: data.email,
    name: data.ho_ten,
    username: data.ten_dang_nhap,
    phone: data.so_dien_thoai,
    avatarUrl: data.anh_dai_dien_url,
    joinedAt: data.ngay_tham_gia,
    status: data.trang_thai,
    role: VAI_TRO_TO_ROLE[data.ma_vai_tro] ?? ROLES.USER,
  };
}

export async function uploadUserAvatar(userId, file) {
  const allowedTypes = new Set(["image/jpeg", "image/png", "image/webp"]);
  if (!allowedTypes.has(file?.type)) {
    throw new Error("Ảnh phải có định dạng JPG, PNG hoặc WEBP.");
  }
  if (file.size > 5 * 1024 * 1024) {
    throw new Error("Ảnh vượt quá dung lượng 5MB.");
  }
  const { data: authData, error: authError } = await supabase.auth.getUser();
  if (authError || !authData.user) throw authError ?? new Error("Phiên đăng nhập không hợp lệ.");
  if (authData.user.id !== userId) throw new Error("Bạn chỉ được đổi ảnh đại diện của chính mình.");

  const extension = file.name.split(".").pop()?.toLowerCase() || "jpg";
  const path = `${userId}/${crypto.randomUUID()}.${extension}`;
  const { error: uploadError } = await supabase.storage
    .from("avatars")
    .upload(path, file, { upsert: false, contentType: file.type, cacheControl: "3600" });
  if (uploadError) throw uploadError;
  const { data } = supabase.storage.from("avatars").getPublicUrl(path);
  const url = data.publicUrl;
  const { error } = await supabase
    .from("nguoi_dung")
    .update({ anh_dai_dien_url: url })
    .eq("ma_nguoi_dung", userId);
  if (error) {
    await supabase.storage.from("avatars").remove([path]);
    throw error;
  }

  const { data: oldFiles } = await supabase.storage.from("avatars").list(userId);
  const obsolete = (oldFiles ?? [])
    .map((item) => `${userId}/${item.name}`)
    .filter((itemPath) => itemPath !== path);
  if (obsolete.length) await supabase.storage.from("avatars").remove(obsolete);
  return url;
}

export async function updateUserProfile(userId, values) {
  const phone = normalizePhone(values.phone);
  if (!values.name.trim() || !values.username.trim()) throw new Error("Họ tên và tên đăng nhập không được để trống.");
  if (phone && !isValidPhone(phone)) throw new Error("Số điện thoại không hợp lệ.");
  const { data, error } = await supabase.from("nguoi_dung").update({
    ho_ten: values.name.trim(),
    ten_dang_nhap: values.username.trim(),
    so_dien_thoai: phone || null,
    cap_nhat_luc: new Date().toISOString(),
  }).eq("ma_nguoi_dung", userId)
    .select("ma_nguoi_dung, ma_vai_tro, email, ho_ten, ten_dang_nhap, so_dien_thoai, anh_dai_dien_url, trang_thai, ngay_tham_gia")
    .single();
  if (error) throw error;
  return {
    id: data.ma_nguoi_dung, name: data.ho_ten, username: data.ten_dang_nhap,
    phone: data.so_dien_thoai, email: data.email, avatarUrl: data.anh_dai_dien_url,
    joinedAt: data.ngay_tham_gia, status: data.trang_thai,
    role: VAI_TRO_TO_ROLE[data.ma_vai_tro] ?? ROLES.USER,
  };
}
