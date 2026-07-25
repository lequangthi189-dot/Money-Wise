import { useEffect, useState } from "react";
import { MOCK_USERS } from "../models/adminData";
import { ROLES } from "../models/constants";

// Controller: quản lý user cho khu vực admin.
//
// TODO (khi có backend thật, vd. Supabase):
//   - getUsers()        -> supabase.from("users").select("*")
//   - setUserStatus()   -> supabase.from("users").update({ status }).eq("id", id)
//   - setUserRole()     -> supabase.from("users").update({ role }).eq("id", id)
// Component gọi hook này (UsersManager.jsx) sẽ KHÔNG cần sửa gì khi đổi
// phần thân các hàm mock dưới đây, miễn shape user giữ nguyên.

function fakeDelay(ms = 400) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function apiGetUsers() {
  await fakeDelay();
  return MOCK_USERS;
}

async function apiSetUserStatus(id, status) {
  await fakeDelay(200);
  const u = MOCK_USERS.find((u) => u.id === id);
  if (u) u.status = status;
  return u;
}

async function apiSetUserRole(id, role) {
  await fakeDelay(200);
  const u = MOCK_USERS.find((u) => u.id === id);
  if (u) u.role = role;
  return u;
}

export function useAdmin() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    apiGetUsers().then((data) => {
      if (active) {
        setUsers(data);
        setLoading(false);
      }
    });
    return () => {
      active = false;
    };
  }, []);

  async function toggleBan(user) {
    const nextStatus = user.status === "banned" ? "active" : "banned";
    await apiSetUserStatus(user.id, nextStatus);
    setUsers((list) =>
      list.map((u) => (u.id === user.id ? { ...u, status: nextStatus } : u)),
    );
  }

  async function toggleAdmin(user) {
    const nextRole = user.role === ROLES.ADMIN ? ROLES.USER : ROLES.ADMIN;
    await apiSetUserRole(user.id, nextRole);
    setUsers((list) =>
      list.map((u) => (u.id === user.id ? { ...u, role: nextRole } : u)),
    );
  }

  return { users, loading, toggleBan, toggleAdmin };
}
