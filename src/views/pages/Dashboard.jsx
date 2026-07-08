import { DONUT, getLegend, getGoals, getRecent } from "../../models/dashboardData";

export default function Dashboard({ t }) {
  const d = t.dashboard;
  const legend = getLegend(t);
  const goals = getGoals(t);
  const recent = getRecent(d);

  return (
    <>
      <div className="alert">
        <svg>
          <use href="#i-warn" />
        </svg>
        <div>{d.alert(t.cats.coffee, "86%", "42.000 ₫")}</div>
      </div>

      <div className="grid g-4">
        <div className="stat glass">
          <div className="row">
            <label>{d.balance}</label>
            <div className="ico ico-pri">
              <svg>
                <use href="#i-wallet" />
              </svg>
            </div>
          </div>
          <div className="val">4.250.000 ₫</div>
          <span className="chg up">↑ 8,2% {d.vsLastMonth}</span>
        </div>
        <div className="stat glass">
          <div className="row">
            <label>{d.spentToday}</label>
            <div className="ico ico-warn">
              <svg>
                <use href="#i-swap" />
              </svg>
            </div>
          </div>
          <div className="val">145.000 ₫</div>
          <span className="chg down">{d.txCount(3)}</span>
        </div>
        <div className="stat glass">
          <div className="row">
            <label>{d.spentWeek}</label>
            <div className="ico ico-cyan">
              <svg>
                <use href="#i-chart" />
              </svg>
            </div>
          </div>
          <div className="val">820.000 ₫</div>
          <span className="chg up">↓ 12% {d.vsLastWeek}</span>
        </div>
        <div className="stat glass">
          <div className="row">
            <label>{d.streakCard}</label>
            <div className="ico ico-ok">
              <svg>
                <use href="#i-flag" />
              </svg>
            </div>
          </div>
          <div className="val">
            12{" "}
            <span style={{ fontSize: "1rem", color: "var(--text-dim)" }}>
              {d.days}
            </span>
          </div>
          <span className="chg up">{d.record(18)}</span>
        </div>
      </div>

      <div className="grid g-21" style={{ marginTop: "18px" }}>
        <div className="card glass">
          <div className="card-h">
            <h3>{d.byCategory}</h3>
            <span className="muted">{d.month}</span>
          </div>
          <div className="donut-wrap">
            <div className="donut">
              <svg width="150" height="150" viewBox="0 0 42 42">
                <circle
                  cx="21"
                  cy="21"
                  r="15.9"
                  fill="none"
                  stroke="var(--track)"
                  strokeWidth="5"
                />
                {DONUT.map((s, i) => (
                  <circle
                    key={i}
                    cx="21"
                    cy="21"
                    r="15.9"
                    fill="none"
                    stroke={s.color}
                    strokeWidth="5"
                    strokeDasharray={s.dash}
                    strokeDashoffset={s.off}
                    transform="rotate(-90 21 21)"
                  />
                ))}
              </svg>
              <div className="center">
                <b>2.18tr</b>
                <small>{d.totalSpent}</small>
              </div>
            </div>
            <div className="legend">
              {legend.map((l, i) => (
                <div className="li" key={i}>
                  <span className="sw" style={{ background: l.c }}></span>
                  {l.name}
                  <b>{l.v}</b>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="card glass">
          <div className="card-h">
            <h3>{d.savingsGoals}</h3>
            <span className="muted">{d.running(3)}</span>
          </div>
          <div
            style={{ display: "flex", flexDirection: "column", gap: "16px" }}
          >
            {goals.map((g, i) => (
              <div key={i}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    fontSize: ".84rem",
                    marginBottom: "7px",
                  }}
                >
                  <span>
                    {g.icon} {g.name}
                  </span>
                  <b>{g.pct}%</b>
                </div>
                <div className="track">
                  <div
                    className={"bar " + g.bar}
                    style={{ width: g.pct + "%" }}
                  ></div>
                </div>
                <small style={{ color: "var(--text-dim)", fontSize: ".74rem" }}>
                  {g.cur} / {g.tot} ₫
                </small>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="card glass" style={{ marginTop: "18px" }}>
        <div className="card-h">
          <h3>{d.recentTx}</h3>
          <span className="muted" style={{ cursor: "pointer" }}>
            {d.viewAll}
          </span>
        </div>
        {recent.map((r, i) => (
          <div className="tx" key={i}>
            <div className={"cat " + r.cls}>{r.icon}</div>
            <div className="meta">
              <b>{r.name}</b>
              <small>
                {r.when} · {t.methods[r.mkey]}
              </small>
            </div>
            <div className={"amt " + r.type}>{r.amt}</div>
          </div>
        ))}
      </div>
    </>
  );
}
