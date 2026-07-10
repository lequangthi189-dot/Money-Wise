import {
  getBudgetRows,
  INITIAL_TOTAL_LIMIT,
  INITIAL_TOTAL_SPENT,
} from "../../models/budgetsData";

export default function Budgets({ query = "", t }) {
  const b = t.budgets;
  const q = query.trim().toLowerCase();
  const BUDGETS = getBudgetRows(t);

  const fmt = (n) => n.toLocaleString("vi-VN") + " ₫";
  const totalPct = Math.round((INITIAL_TOTAL_SPENT / INITIAL_TOTAL_LIMIT) * 100);
  const totalLeft = INITIAL_TOTAL_LIMIT - INITIAL_TOTAL_SPENT;

  // Gõ đúng "hạn mức" -> hiện tất cả; ngược lại lọc theo tên danh mục.
  const wantAll = q && t.nav.budgets.toLowerCase().includes(q);
  const rows = q
    ? BUDGETS.filter(
        (r) => wantAll || t.cats[r.catKey].toLowerCase().includes(q),
      )
    : BUDGETS;

  const swatch = {
    width: "32px",
    height: "32px",
    borderRadius: "9px",
    display: "grid",
    placeItems: "center",
  };
  const dim = { background: "var(--surface-2)", color: "var(--text-dim)" };

  return (
    <>
      <div className="grid g-12">
        <div>
          <div className="card glass" style={{ marginBottom: "18px" }}>
            <div className="card-h">
              <h3>{b.totalTitle}</h3>
            </div>
            <div style={{ textAlign: "center", margin: "6px 0 16px" }}>
              <div
                style={{
                  fontSize: "2rem",
                  fontWeight: "700",
                  letterSpacing: "-.5px",
                }}
              >
                {fmt(INITIAL_TOTAL_SPENT)}
              </div>
              <small style={{ color: "var(--text-dim)" }}>
                {b.spentOver(fmt(INITIAL_TOTAL_LIMIT))}
              </small>
            </div>
            <div className="track" style={{ height: "13px" }}>
              <div
                className={
                  "bar " + (totalPct >= 100 ? "danger" : totalPct >= 80 ? "warn" : "")
                }
                style={{ width: Math.min(totalPct, 100) + "%" }}
              ></div>
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginTop: "9px",
                fontSize: ".8rem",
              }}
            >
              <span style={{ color: "var(--warn)" }}>
                {b.usedPct(totalPct + "%")}
              </span>
              <span style={{ color: "var(--text-dim)" }}>
                {b.left(fmt(totalLeft))}
              </span>
            </div>
          </div>

          <div className="card glass">
            <div className="card-h">
              <h3>{b.setTitle}</h3>
            </div>
            <div className="field">
              <label>{b.kind}</label>
              <select>
                <option>{b.kindTotal}</option>
                <option>{b.kindByCat}</option>
              </select>
            </div>
            <div className="field">
              <label>{b.category}</label>
              <select>
                <option>☕ {t.cats.coffee}</option>
                <option>🍜 {t.cats.food}</option>
              </select>
            </div>
            <div className="field">
              <label>{b.limitAmount}</label>
              <input defaultValue="300.000" placeholder="0 ₫" />
            </div>
            <button className="btn btn-primary" style={{ width: "100%" }}>
              {b.saveLimit}
            </button>
          </div>
        </div>

        <div className="card glass">
          <div className="card-h">
            <h3>{b.byCatTitle}</h3>
            <span className="muted">{b.warnNote}</span>
          </div>

          {q && (
            <div
              style={{
                fontSize: ".78rem",
                color: "var(--text-dim)",
                marginBottom: "10px",
              }}
            >
              {b.result(query, rows.length)}
            </div>
          )}

          {rows.map((r) => (
            <div className="budrow" key={r.id}>
              <div className="top">
                <div className={"cat " + r.cls} style={swatch}>
                  {r.icon}
                </div>
                <b>{r.name}</b>
                <span className="nums">
                  <b>{r.cur}</b> / {r.tot} ₫
                </span>
                {r.badge === "dim" ? (
                  <span className="badge" style={dim}>
                    {r.pct}%
                  </span>
                ) : (
                  <span className={"badge " + r.badge}>{r.pct}%</span>
                )}
              </div>
              <div className="track">
                <div
                  className={"bar " + r.bar}
                  style={{ width: r.pct + "%" }}
                ></div>
              </div>
            </div>
          ))}

          {rows.length === 0 && (
            <div
              style={{
                padding: "26px 10px",
                textAlign: "center",
                color: "var(--text-dim)",
                fontSize: ".85rem",
              }}
            >
              {b.noResult(query)}
            </div>
          )}
        </div>
      </div>
    </>
  );
} 