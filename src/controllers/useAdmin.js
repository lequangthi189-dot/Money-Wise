import { useEffect, useState } from "react";
import { adminUpdateAccount, fetchUsers } from "../models/quanTriData";
import { ROLES } from "../models/constants";

// Controller: danh sách tài khoản cho khu vực quản trị.
// Mọi thay đổi đi qua RPC quan_tri_cap_nhat_tai_khoan; DB tự chặn admin
// thao tác lên chính mình, ở đây chặn thêm để nút bị disable từ trước.
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

  async function toggleBan(user) {
    if (isSelf(user)) return false;
    const nextStatus = user.status === "banned" ? "active" : "banned";
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

  return { users, loading, error, toggleBan, toggleAdmin, isSelf };
}
