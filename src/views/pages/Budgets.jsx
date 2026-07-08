import { useBudgets } from "../../controllers/useBudgets";
import { getBudgetRows } from "../../models/budgetsData";

export default function Budgets({ t }) {
  const b = t.budgets;
  const {
    totalLimit,
    totalSpent,
    limitInput,
    setLimitInput,
    limitType,
    setLimitType,
    selectedCategory,
    setSelectedCategory,
    totalPct,
    totalLeft,
    handleSaveLimit,
  } = useBudgets();
  const rows = getBudgetRows(t);
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
                {totalSpent.toLocaleString("vi-VN")} ₫
              </div>
              <small style={{ color: "var(--text-dim)" }}>
                {b.spentOver(totalLimit.toLocaleString("vi-VN") + " ₫")}
              </small>
            </div>
            <div className="track" style={{ height: "13px" }}>
              <div className="bar warn" style={{ width: totalPct + "%" }}></div>
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginTop: "9px",
                fontSize: ".8rem",
              }}
            >
              <span style={{ color: "var(--warn)" }}>{b.usedPct(totalPct + "%")}</span>
              <span style={{ color: "var(--text-dim)" }}>
                {b.left(totalLeft.toLocaleString("vi-VN") + " ₫")}
              </span>
            </div>
          </div>
          <div className="card glass">
            <div className="card-h">
              <h3>{b.setTitle}</h3>
            </div>
           <div className="field">
              <label>{b.kind}</label>
              <select
                value={limitType}
                onChange={(e) => setLimitType(e.target.value)}
              >
                <option value="total">{b.kindTotal}</option>
                <option value="category">{b.kindByCat}</option>
              </select>
            </div>
            {limitType === "category" && (
              <div className="field">
                <label>{b.category}</label>

                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                >
                  <option value="coffee">☕ {t.cats.coffee}</option>
                  <option value="food">🍜 {t.cats.food}</option>
                  <option value="fun">🎮 {t.cats.fun}</option>
                  <option value="move">🛵 {t.cats.move}</option>
                  <option value="shop">🛍️ {t.cats.shop}</option>
                </select>
              </div>
            )}
            <div className="field">
              <label>{b.limitAmount}</label>
              <input
                value={limitInput}
                onChange={(e) => setLimitInput(e.target.value)}
                placeholder="0 ₫"
              />
            </div>
            <button
              className="btn btn-primary"
              style={{ width: "100%" }}
              onClick={handleSaveLimit}
            >
              {b.saveLimit}
            </button>
          </div>
        </div>

        <div className="card glass">
          <div className="card-h">
            <h3>{b.byCatTitle}</h3>
            <span className="muted">{b.warnNote}</span>
          </div>
          {rows.map((r, i) => (
            <div className="budrow" key={i}>
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
        </div>
      </div>
    </>
  );
}
