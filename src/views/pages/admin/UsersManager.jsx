import { useAdmin } from "../../../controllers/useAdmin";
import { ROLES } from "../../../models/constants";
import { Icon } from "../../components/icons";

export default function UsersManager({ at, currentEmail }) {
  const u = at.users;
  const { users, loading, error, toggleBan, toggleAdmin, isSelf } =
    useAdmin(currentEmail);

  return (
    <div className="card glass">
      <div className="card-h">
        <div>
          <h3>{u.heading}</h3>
          <span className="muted">{u.sub}</span>
        </div>
      </div>

      {error && (
        <div
          style={{
            fontSize: ".8rem",
            color: "var(--danger)",
            background: "rgba(248,113,113,.12)",
            border: "1px solid rgba(248,113,113,.3)",
            borderRadius: "10px",
            padding: "10px 12px",
            margin: "10px 0",
          }}
        >
          {error}
        </div>
      )}

      {loading ? (
        <p className="muted" style={{ padding: "16px 4px" }}>
          {u.loading}
        </p>
      ) : users.length === 0 ? (
        <p className="muted" style={{ padding: "16px 4px" }}>
          {u.empty}
        </p>
      ) : (
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ textAlign: "left", color: "var(--text-dim)" }}>
                <th style={thStyle}>{u.colName}</th>
                <th style={thStyle}>{u.colEmail}</th>
                <th style={thStyle}>{u.colRole}</th>
                <th style={thStyle}>{u.colStatus}</th>
                <th style={thStyle}>{u.colJoined}</th>
                <th style={thStyle}>{u.colActions}</th>
              </tr>
            </thead>
            <tbody>
              {users.map((usr) => {
                const isAdmin = usr.role === ROLES.ADMIN;
                const isBanned = usr.status === "banned";
                const self = isSelf(usr);
                return (
                  <tr key={usr.id} style={{ borderTop: "1px solid var(--border)" }}>
                    <td style={tdStyle}>
                      <b>{usr.name}</b>
                    </td>
                    <td style={tdStyle}>{usr.email}</td>
                    <td style={tdStyle}>
                      <span className={"badge " + (isAdmin ? "b-in" : "")}>
                        {isAdmin ? u.roleAdmin : u.roleUser}
                      </span>
                    </td>
                    <td style={tdStyle}>
                      <span className={"badge " + (isBanned ? "b-out" : "b-in")}>
                        {isBanned ? u.statusBanned : u.statusActive}
                      </span>
                    </td>
                    <td style={tdStyle}>{usr.createdAt}</td>
                    <td style={tdStyle}>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          flexWrap: "wrap",
                          gap: "12px",
                        }}
                      >
                        <button
                          className="btn"
                          style={actionButtonStyle}
                          disabled={self}
                          title={self ? u.selfActionBlocked : undefined}
                          onClick={() => {
                            if (self) return window.alert(u.selfActionBlocked);
                            const msg = isBanned
                              ? u.confirmUnban(usr.name)
                              : u.confirmBan(usr.name);
                            if (window.confirm(msg)) toggleBan(usr);
                          }}
                        >
                          <Icon n="i-warn" size={14} />
                          {isBanned ? u.unban : u.ban}
                        </button>
                        <button
                          className="btn"
                          style={actionButtonStyle}
                          disabled={self}
                          title={self ? u.selfActionBlocked : undefined}
                          onClick={() => {
                            if (self) return window.alert(u.selfActionBlocked);
                            const msg = isAdmin
                              ? u.confirmRevokeAdmin(usr.name)
                              : u.confirmMakeAdmin(usr.name);
                            if (window.confirm(msg)) toggleAdmin(usr);
                          }}
                        >
                          <Icon n="i-gear" size={14} />
                          {isAdmin ? u.revokeAdmin : u.makeAdmin}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

const thStyle = { padding: "10px 8px", fontSize: "0.8rem", fontWeight: 600 };
const tdStyle = { padding: "10px 8px", fontSize: "0.88rem" };
const actionButtonStyle = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  gap: "8px",
  whiteSpace: "nowrap",
};
