const NEW_USERS_BARS = [
  { h: "40%" },
  { h: "55%" },
  { h: "48%" },
  { h: "70%" },
  { h: "62%" },
  {
    h: "82%",
    grad: "linear-gradient(180deg,var(--accent-2),rgba(34,211,238,.3))",
  },
];

const RECENT_USERS = [
  {
    initials: "TN",
    cls: "c-salary",
    name: "Thi Nguyễn",
    email: "thi@huflit.edu.vn",
    joined: "01/06/2026",
    active: true,
  },
  {
    initials: "VH",
    cls: "c-move",
    name: "Văn Hùng",
    email: "hung.vn@huflit.edu.vn",
    joined: "28/05/2026",
    active: true,
  },
  {
    initials: "MP",
    cls: "c-coffee",
    name: "Mai Phương",
    email: "phuong.mai@huflit.edu.vn",
    joined: "22/05/2026",
    active: true,
  },
  {
    initials: "QT",
    cls: "c-food",
    name: "Quang Thi",
    email: "quangthi@huflit.edu.vn",
    joined: "14/05/2026",
    active: false,
  },
];

export default function Admin({ t }) {
  const a = t.admin;

  return (
    <>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "12px",
          marginBottom: "18px",
        }}
      >
        <select style={{ width: "auto" }}>
          {a.monthOpts.map((m, i) => (
            <option key={i}>{m}</option>
          ))}
        </select>
        <div style={{ flex: "1" }}></div>
        <button className="btn">
          <svg
            width="16"
            height="16"
            style={{ verticalAlign: "-3px", marginRight: "5px" }}
          >
            <use href="#i-copy" />
          </svg>
          {a.exportReport}
        </button>
      </div>

      <div className="grid g-4">
        <div className="stat glass">
          <div className="row">
            <label>{a.totalUsers}</label>
            <div className="ico ico-pri">
              <svg>
                <use href="#i-users" />
              </svg>
            </div>
          </div>
          <div className="val sm">1.248</div>
          <span className="chg up">{a.newUsers(46)}</span>
        </div>

        <div className="stat glass">
          <div className="row">
            <label>{a.totalIncome}</label>
            <div className="ico ico-ok">
              <svg>
                <use href="#i-wallet" />
              </svg>
            </div>
          </div>
          <div className="val sm" style={{ color: "var(--ok)" }}>
            482.500.000 ₫
          </div>
        </div>

        <div className="stat glass">
          <div className="row">
            <label>{a.totalExpense}</label>
            <div className="ico ico-warn">
              <svg>
                <use href="#i-swap" />
              </svg>
            </div>
          </div>
          <div className="val sm" style={{ color: "var(--danger)" }}>
            356.200.000 ₫
          </div>
        </div>

        <div className="stat glass">
          <div className="row">
            <label>{a.userGrowth}</label>
            <div className="ico ico-cyan">
              <svg>
                <use href="#i-chart" />
              </svg>
            </div>
          </div>
          <div className="val sm">+12%</div>
          <span className="chg up">{a.vsLastMonth}</span>
        </div>
      </div>

      <div className="grid g-2" style={{ marginTop: "18px" }}>
        <div className="card glass">
          <div className="card-h">
            <h3>{a.newUsersByMonth}</h3>
            <span className="muted">{a.barChart}</span>
          </div>
          <div className="barchart">
            {NEW_USERS_BARS.map((bar, i) => (
              <div className="col" key={i}>
                <div
                  className="bw"
                  style={{ height: bar.h, background: bar.grad || undefined }}
                ></div>
                <small>{a.months6[i]}</small>
              </div>
            ))}
          </div>
        </div>

        <div className="card glass">
          <div className="card-h">
            <h3>{a.systemTrend}</h3>
            <span className="muted">{a.lineChart}</span>
          </div>
          <svg
            width="100%"
            height="170"
            viewBox="0 0 600 170"
            preserveAspectRatio="none"
            style={{ overflow: "visible" }}
          >
            <polyline
              fill="none"
              stroke="var(--ok)"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
              points="10,120 110,95 210,100 310,60 410,70 510,45 590,30"
            />
            <polyline
              fill="none"
              stroke="var(--danger)"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
              points="10,145 110,130 210,140 310,110 410,120 510,100 590,95"
            />
          </svg>
          <div
            style={{
              display: "flex",
              gap: "16px",
              marginTop: "10px",
              fontSize: ".8rem",
              color: "var(--text-dim)",
            }}
          >
            <span>
              <span
                style={{
                  display: "inline-block",
                  width: "10px",
                  height: "10px",
                  borderRadius: "50%",
                  background: "var(--ok)",
                  marginRight: "6px",
                }}
              ></span>
              {t.thu}
            </span>
            <span>
              <span
                style={{
                  display: "inline-block",
                  width: "10px",
                  height: "10px",
                  borderRadius: "50%",
                  background: "var(--danger)",
                  marginRight: "6px",
                }}
              ></span>
              {t.chi}
            </span>
          </div>
        </div>
      </div>

      <div className="card glass" style={{ marginTop: "18px" }}>
        <div className="card-h">
          <h3>{a.recentUsers}</h3>
          <span className="muted" style={{ cursor: "pointer" }}>
            {a.viewAll}
          </span>
        </div>
        {RECENT_USERS.map((u, i) => (
          <div className="tx" key={i}>
            <div className={"cat " + u.cls}>{u.initials}</div>
            <div className="meta">
              <b>{u.name}</b>
              <small>
                {u.email} · {a.joined(u.joined)}
              </small>
            </div>
            <div
              className="amt"
              style={{ color: u.active ? "var(--ok)" : "var(--danger)" }}
            >
              {u.active ? a.statusActive : a.statusLocked}
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
