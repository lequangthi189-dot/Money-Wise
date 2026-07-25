import { MOCK_USERS } from "../../../models/adminData";

// TODO: thay bằng số liệu thật từ backend (tổng user, giao dịch, tăng trưởng...).
export default function AdminStats() {
  const total = MOCK_USERS.length;
  const banned = MOCK_USERS.filter((u) => u.status === "banned").length;
  const admins = MOCK_USERS.filter((u) => u.role === "admin").length;

  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: "16px" }}>
      <div className="card glass" style={{ padding: "18px" }}>
        <span className="muted">Tổng người dùng</span>
        <h2 style={{ margin: "6px 0 0" }}>{total}</h2>
      </div>
      <div className="card glass" style={{ padding: "18px" }}>
        <span className="muted">Tài khoản bị khóa</span>
        <h2 style={{ margin: "6px 0 0" }}>{banned}</h2>
      </div>
      <div className="card glass" style={{ padding: "18px" }}>
        <span className="muted">Admin</span>
        <h2 style={{ margin: "6px 0 0" }}>{admins}</h2>
      </div>
    </div>
  );
}
