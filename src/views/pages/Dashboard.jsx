import { useDashboard } from "../../controllers/useDashboard";

export default function Dashboard({ t, streak }) {
  const d = t.dashboard;
  const {
    legend, donut, goals, recent, totalSpentLabel,
    spentToday, spentWeek, txCountToday,
    balance, streak: streakDays, streakRecord, budgetAlert, balanceChange, weekChange, monthLabel,
  } = useDashboard(t, streak);

  return (
    <div className="dashboard-page">
      {budgetAlert && <div className="alert">
        <svg><use href="#i-warn" /></svg>
        <div>{d.alert(budgetAlert.name, `${budgetAlert.pct}%`, `${Math.max(0, budgetAlert.left).toLocaleString("vi-VN")} ₫`)}</div>
      </div>}

      <div className="dashboard-stats">
        <div className="stat glass">
          <div className="row">
            <label>{d.balance}</label>
            <div className="ico ico-pri"><svg><use href="#i-wallet" /></svg></div>
          </div>
          <div className="val">{balance.toLocaleString("vi-VN")} ₫</div>
          {balanceChange !== null && <span className={`chg ${balanceChange >= 0 ? "up" : "down"}`}>{balanceChange >= 0 ? "↑" : "↓"} {Math.abs(balanceChange)}% {d.vsLastMonth}</span>}
        </div>
        <div className="stat glass">
          <div className="row">
            <label>{d.spentToday}</label>
            <div className="ico ico-warn"><svg><use href="#i-swap" /></svg></div>
          </div>
          <div className="val">{spentToday.toLocaleString("vi-VN")} ₫</div>
          <span className="chg down">{d.txCount(txCountToday)}</span>
        </div>
        <div className="stat glass">
          <div className="row">
            <label>{d.spentWeek}</label>
            <div className="ico ico-cyan"><svg><use href="#i-chart" /></svg></div>
          </div>
          <div className="val">{spentWeek.toLocaleString("vi-VN")} ₫</div>
          {weekChange !== null && <span className={`chg ${weekChange <= 0 ? "up" : "down"}`}>{weekChange <= 0 ? "↓" : "↑"} {Math.abs(weekChange)}% {d.vsLastWeek}</span>}
        </div>
        <div className="stat glass">
          <div className="row">
            <label>{d.streakCard}</label>
            <div className="ico ico-ok"><svg><use href="#i-flag" /></svg></div>
          </div>
          <div className="val">
            {streakDays} <span style={{ fontSize: "1rem", color: "var(--text-dim)" }}>{d.days}</span>
          </div>
          <span className="chg up">{d.record(streakRecord)}</span>
        </div>
      </div>

      <div className="dashboard-main">
        <div className="card glass dashboard-category-card">
          <div className="card-h">
            <h3>{d.byCategory}</h3>
            <span className="muted">{monthLabel}</span>
          </div>
          <div className="donut-wrap">
            <div className="donut">
              <svg width="150" height="150" viewBox="0 0 42 42">
                <circle cx="21" cy="21" r="15.9" fill="none" stroke="var(--track)" strokeWidth="5" />
                {donut.map((s, i) => (
                  <circle
                    key={i} cx="21" cy="21" r="15.9" fill="none" stroke={s.color} strokeWidth="5"
                    strokeDasharray={s.dash} strokeDashoffset={s.off} transform="rotate(-90 21 21)"
                  />
                ))}
              </svg>
              <div className="center">
                <b>{totalSpentLabel}</b>
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

        <div className="card glass dashboard-goals-card">
          <div className="card-h">
            <h3>{d.savingsGoals}</h3>
            <span className="muted">{d.running(goals.length)}</span>
          </div>
          <div className="dashboard-goals-list">
            {goals.map((g, i) => (
              <div key={i}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: ".84rem", marginBottom: "7px" }}>
                  <span>{g.icon} {g.name}</span>
                  <b>{g.pct}%</b>
                </div>
                <div className="track">
                  <div className={"bar " + g.bar} style={{ width: g.pct + "%" }}></div>
                </div>
                <small style={{ color: "var(--text-dim)", fontSize: ".74rem" }}>{g.cur} / {g.tot} ₫</small>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="card glass dashboard-recent-card">
        <div className="card-h">
          <h3>{d.recentTx}</h3>
          <span className="muted" style={{ cursor: "pointer" }}>{d.viewAll}</span>
        </div>
        <div className="dashboard-recent-list">
          {recent.map((r, i) => (
            <div className="dashboard-recent-row" key={i}>
              <div className={"dashboard-recent-icon " + r.cls}>{r.icon}</div>
              <div className="dashboard-recent-meta">
                <b>{r.name}</b>
                <small>{r.when} · {t.methods[r.mkey]}</small>
              </div>
              <div className={"dashboard-recent-amount " + r.type}>{r.amt}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
