import { BUDGETS } from "../../models/data";

export default function Budgets({ query = "", t }) {
  const b = t.budgets;
  const q = query.trim().toLowerCase();

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
                2.180.000 ₫
              </div>
              <small style={{ color: "var(--text-dim)" }}>
                {b.spentOver("3.000.000 ₫")}
              </small>
            </div>
            <div className="track" style={{ height: "13px" }}>
              <div className="bar warn" style={{ width: "73%" }}></div>
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginTop: "9px",
                fontSize: ".8rem",
              }}
            >
              <span style={{ color: "var(--warn)" }}>{b.usedPct("73%")}</span>
              <span style={{ color: "var(--text-dim)" }}>
                {b.left("820.000 ₫")}
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
                <b>{t.cats[r.catKey]}</b>
                <span className="nums">
                  <b>{r.spent}</b> / {r.limit} ₫
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