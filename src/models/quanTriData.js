// Model: danh sách người dùng cho khu vực quản trị.
// Đọc trực tiếp bảng nguoi_dung (policy doc_nguoi_dung cho admin thấy hết),
// còn khoá/mở và cấp/thu quyền phải đi qua RPC vì DB đã thu hồi quyền update
// các cột đó — RPC ghi luôn nhat_ky_quan_tri trong cùng transaction.
import { supabase } from "./supabase";
import { ROLES } from "./constants";

const ROLE_FROM_VAI_TRO = { ADMIN: ROLES.ADMIN, USER: ROLES.USER };
const STATUS_FROM_TRANG_THAI = { HOAT_DONG: "active", DA_KHOA: "banned" };

function toUI(row) {
  return {
    id: row.ma_nguoi_dung,
    name: row.ho_ten,
    email: row.email,
    role: ROLE_FROM_VAI_TRO[row.ma_vai_tro] ?? ROLES.USER,
    status: STATUS_FROM_TRANG_THAI[row.trang_thai] ?? "active",
    createdAt: (row.ngay_tham_gia ?? "").slice(0, 10),
  };
}

export async function fetchUsers() {
  const { data, error } = await supabase
    .from("nguoi_dung")
    .select("ma_nguoi_dung, ho_ten, email, ma_vai_tro, trang_thai, ngay_tham_gia")
    .order("ngay_tham_gia", { ascending: false });

  if (error) throw error;
  return data.map(toUI);
}

// hanhDong: 'KHOA' | 'MO_KHOA' | 'CAP_QUYEN' | 'THU_HOI_QUYEN'
export async function adminUpdateAccount(userId, hanhDong, lyDo = null) {
  const { error } = await supabase.rpc("quan_tri_cap_nhat_tai_khoan", {
    p_ma_nguoi_dung: userId,
    p_hanh_dong: hanhDong,
    p_ly_do: lyDo,
  });
  if (error) throw error;
}
