import { useEffect, useState } from "react";
import { fetchUsers } from "../../../models/quanTriData";
import { ROLES } from "../../../models/constants";

// Thống kê tài khoản, đếm từ bảng nguoi_dung (policy doc_nguoi_dung cho
// admin thấy toàn bộ). Số liệu giao dịch toàn hệ thống thì RLS chặn, muốn
// có phải thêm RPC security definer riêng.
export default function AdminStats({ at }) {
  const s = at.stats;
  const [users, setUsers] = useState([]);

  useEffect(() => {
    let alive = true;
    fetchUsers().then(
      (data) => alive && setUsers(data),
      () => {},
    );
    return () => {
      alive = false;
    };
  }, []);

  const total = users.length;
  const banned = users.filter((u) => u.status === "banned").length;
  const admins = users.filter((u) => u.role === ROLES.ADMIN).length;

  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: "16px" }}>
      <div className="card glass" style={{ padding: "18px" }}>
        <span className="muted">{s.totalUsers}</span>
        <h2 style={{ margin: "6px 0 0" }}>{total}</h2>
      </div>
      <div className="card glass" style={{ padding: "18px" }}>
        <span className="muted">{s.bannedUsers}</span>
        <h2 style={{ margin: "6px 0 0" }}>{banned}</h2>
      </div>
      <div className="card glass" style={{ padding: "18px" }}>
        <span className="muted">{s.admins}</span>
        <h2 style={{ margin: "6px 0 0" }}>{admins}</h2>
      </div>
    </div>
  );
}
