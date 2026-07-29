import { MOCK_USERS } from "../../../models/adminData";

// TODO: thay bằng số liệu thật từ backend (tổng user, giao dịch, tăng trưởng...).
export default function AdminStats({ at }) {
  const s = at.stats;
  const total = MOCK_USERS.length;
  const banned = MOCK_USERS.filter((u) => u.status === "banned").length;
  const admins = MOCK_USERS.filter((u) => u.role === "admin").length;

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
