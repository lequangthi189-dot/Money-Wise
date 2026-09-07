import { useEffect, useState } from "react";
import { adminUpdateAccount, fetchUsers } from "../models/quanTriData";
import { ROLES, ROOT_ADMIN_EMAIL } from "../models/constants";

// Controller: danh sách tài khoản cho khu vực quản trị.
// Mọi thay đổi đi qua RPC quan_tri_cap_nhat_tai_khoan; DB tự chặn admin
// thao tác lên chính mình, và trigger chặn khoá/hạ quyền/xoá admin gốc; ở
// đây chặn thêm để nút bị disable từ trước.
export function useAdmin(currentEmail) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    fetchUsers().then(
      (data) => {
        if (!active) return;
        setUsers(data);
        setLoading(false);
      },
      (e) => {
        if (!active) return;
        setError(e.message);
        setLoading(false);
      },
    );
    return () => {
      active = false;
    };
  }, []);

  function isSelf(user) {
    return (
      !!currentEmail && user.email.toLowerCase() === currentEmail.toLowerCase()
    );
  }

  // Admin gốc: không khoá, không hạ vai trò. Chỉ chặn chiều gây hại — mở
  // khoá và cấp lại quyền vẫn để mở, phòng khi tài khoản rơi vào trạng thái
  // đó vì lý do nào đó.
  function isRootAdmin(user) {
    return user.email.toLowerCase() === ROOT_ADMIN_EMAIL.toLowerCase();
  }

  async function toggleBan(user) {
    if (isSelf(user)) return false;
    const nextStatus = user.status === "banned" ? "active" : "banned";
    if (nextStatus === "banned" && isRootAdmin(user)) return false;
    try {
      await adminUpdateAccount(
        user.id,
        nextStatus === "banned" ? "KHOA" : "MO_KHOA",
      );
    } catch (e) {
      setError(e.message);
      return false;
    }
    setUsers((list) =>
      list.map((u) => (u.id === user.id ? { ...u, status: nextStatus } : u)),
    );
    return true;
  }

  async function toggleAdmin(user) {
    if (isSelf(user)) return false;
    const nextRole = user.role === ROLES.ADMIN ? ROLES.USER : ROLES.ADMIN;
    if (nextRole === ROLES.USER && isRootAdmin(user)) return false;
    try {
      await adminUpdateAccount(
        user.id,
        nextRole === ROLES.ADMIN ? "CAP_QUYEN" : "THU_HOI_QUYEN",
      );
    } catch (e) {
      setError(e.message);
      return false;
    }
    setUsers((list) =>
      list.map((u) => (u.id === user.id ? { ...u, role: nextRole } : u)),
    );
    return true;
  }

  return { users, loading, error, toggleBan, toggleAdmin, isSelf, isRootAdmin };
}
