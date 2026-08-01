import { useBudgets } from "../../controllers/useBudgets";

export default function Budgets({ t }) {
  const b = t.budgets;
  const swatch = {
    width: "32px",
    height: "32px",
    borderRadius: "9px",
    display: "grid",
    placeItems: "center",
  };
  const {
    totalLimit,
    totalSpent,
    limitInput,
    setLimitInput,
    limitType,
    setLimitType,
    totalPct,
    totalLeft,
    handleSaveLimit,
    budgetRows,
    selectedCategory,
    setSelectedCategory,
    expenseCategories,
  } = useBudgets(t);
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
              <div style={{ fontSize: "2rem", fontWeight: "700", letterSpacing: "-.5px" }}>
                {totalSpent.toLocaleString("vi-VN")} ₫
              </div>
              <small style={{ color: "var(--text-dim)" }}>
                {b.spentOver(totalLimit.toLocaleString("vi-VN") + " ₫")}
              </small>
            </div>
            <div className="track" style={{ height: "13px" }}>
              <div
                className={"bar " + (totalPct >= 95 ? "danger" : totalPct >= 80 ? "warn" : "")}
                style={{ width: Math.min(totalPct, 100) + "%" }}
              ></div>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: "9px", fontSize: ".8rem" }}>
              <span style={{ color: "var(--warn)" }}>{b.usedPct(totalPct + "%")}</span>
              <span style={{ color: "var(--text-dim)" }}>{b.left(totalLeft.toLocaleString("vi-VN") + " ₫")}</span>
            </div>
          </div>

          <div className="card glass">
            <div className="card-h">
              <h3>{b.setTitle}</h3>
            </div>
            <div className="field">
              <label>{b.kind}</label>
              <select value={limitType} onChange={(e) => setLimitType(e.target.value)}>
                <option value={b.kindTotal}>{b.kindTotal}</option>
                <option value={b.kindByCat}>{b.kindByCat}</option>
              </select>
            </div>
            {limitType === b.kindByCat && (
              <div className="field">
                <label>{b.category}</label>
                <select
                  value={selectedCategory ?? ""}
                  onChange={(e) => setSelectedCategory(Number(e.target.value))}
                >
                  {expenseCategories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.icon} {c.name || t.cats[c.key]}
                    </option>
                  ))}
                </select>
              </div>
            )}
            <div className="field">
              <label>{b.limitAmount}</label>
              <input value={limitInput} onChange={(e) => setLimitInput(e.target.value)} placeholder="0 ₫" />
            </div>
            <button className="btn btn-primary" style={{ width: "100%" }} onClick={handleSaveLimit}>
              {b.saveLimit}
            </button>
          </div>
        </div>

        <div className="card glass">
          <div className="card-h">
            <h3>{b.byCatTitle}</h3>
            <span className="muted">{b.warnNote}</span>
          </div>

          {budgetRows.length === 0 && (
            <div style={{ padding: "20px 8px", color: "var(--text-dim)", fontSize: ".85rem" }}>
              {b.noBudgetYet || "Chưa có hạn mức nào được đặt theo danh mục."}
            </div>
          )}

          {budgetRows.map((r) => (
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
                <div className={"bar " + r.bar} style={{ width: r.pct + "%" }}></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}