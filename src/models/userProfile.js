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

// Các mã cho biết chuỗi ĐÃ được ghi (hoặc đã ghi từ trước trong ngày).
// TS08 chỉ để phân loại "đúng hạn / trễ", không chặn ghi, nên hai mã
// DA_GHI_NHAN_TRE và DA_GHI_NHAN_KHONG_RO_PHIEN vẫn là thành công.
const CHUOI_DA_GHI = new Set([
  "DA_GHI_NHAN",
  "DA_GHI_NHAN_TRE",
  "DA_GHI_NHAN_KHONG_RO_PHIEN",
  "DA_GHI_TRONG_NGAY",
]);

// Ghi nhận chuỗi ngày đăng nhập (BM13). Hàm DB tự lấy auth.uid() nên không
// cần truyền tham số. Lỗi ở đây không được chặn việc vào app.
// Mã còn lại: 'KHONG_CO_BAN_GHI' — thiếu dòng trong chuoi_dang_nhap, tức là
// hồ sơ dựng thiếu; phải thấy được chứ không hỏng âm thầm.
export async function touchLoginStreak() {
  const { data, error } = await supabase.rpc("cap_nhat_chuoi_dang_nhap");
  if (error) {
    console.warn("cap_nhat_chuoi_dang_nhap lỗi:", error.message);
    return null;
  }
  if (!CHUOI_DA_GHI.has(data)) {
    console.warn("Chuỗi đăng nhập không được ghi nhận:", data);
  }
  return data;
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
