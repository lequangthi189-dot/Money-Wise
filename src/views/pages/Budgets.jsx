import { useEffect, useMemo, useState } from "react";
import {
  getBudgetRows,
  INITIAL_TOTAL_LIMIT,
  INITIAL_TOTAL_SPENT,
  readBudgetState,
  writeBudgetState,
} from "../../models/budgetsData";
import { fetchCategories } from "../../models/danhMucData";

export default function Budgets({ query = "", t }) {
  const b = t.budgets;
  const q = query.trim().toLowerCase();
  const [categories, setCategories] = useState([]);
  const [budgetState, setBudgetState] = useState(() => readBudgetState());
  const [limitType, setLimitType] = useState("total");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [limitInput, setLimitInput] = useState("300.000");
  const BUDGETS = useMemo(() => getBudgetRows(t, categories, budgetState), [t, categories, budgetState]);

  useEffect(() => {
    let alive = true;
    fetchCategories()
      .then((data) => {
        if (alive) {
          setCategories(data);
          setSelectedCategory((prev) => prev || String(data[0]?.id ?? ""));
        }
      })
      .catch(() => {
        if (alive) setCategories([]);
      });

    return () => {
      alive = false;
    };
  }, []);

  const fmt = (n) => Number(n).toLocaleString("vi-VN") + " ₫";
  const totalLimit = budgetState.totalLimit;
  const totalSpent = budgetState.totalSpent;
  const totalPct = Math.round((totalSpent / totalLimit) * 100);
  const totalLeft = totalLimit - totalSpent;

  function handleSaveLimit() {
    const value = Number(limitInput.replaceAll(".", "").replaceAll(",", ""));

    if (Number.isNaN(value) || value < 0) {
      alert("Hạn mức phải là số không âm");
      return;
    }

    const nextState = { ...budgetState };

    if (limitType === "total") {
      const categoryTotal = Object.values(nextState.categoryLimits || {}).reduce(
        (sum, item) => sum + Number(item?.tot || 0),
        0,
      );
      if (value < categoryTotal) {
        alert("Hạn mức tổng tháng không được nhỏ hơn tổng hạn mức các danh mục");
        return;
      }
      nextState.totalLimit = value;
    } else {
      if (!selectedCategory) {
        alert("Vui lòng chọn danh mục");
        return;
      }

      const nextCategoryLimits = {
        ...nextState.categoryLimits,
        [selectedCategory]: {
          ...(nextState.categoryLimits[selectedCategory] || {}),
          tot: value,
        },
      };

      const categoryTotal = Object.values(nextCategoryLimits).reduce(
        (sum, item) => sum + Number(item?.tot || 0),
        0,
      );

      if (categoryTotal > nextState.totalLimit) {
        alert("Tổng hạn mức các danh mục không được vượt quá hạn mức tổng tháng");
        return;
      }

      nextState.categoryLimits = nextCategoryLimits;
    }

    const savedState = writeBudgetState(nextState);
    setBudgetState(savedState);
    setLimitInput(value.toLocaleString("vi-VN"));
  }

  // Gõ đúng "hạn mức" -> hiện tất cả; ngược lại lọc theo tên danh mục.
  const wantAll = q && t.nav.budgets.toLowerCase().includes(q);
  const rows = q
    ? BUDGETS.filter(
        (r) => wantAll || String(r.name).toLowerCase().includes(q),
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
                {fmt(totalSpent)}
              </div>
              <small style={{ color: "var(--text-dim)" }}>
                {b.spentOver(fmt(totalLimit))}
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
              <select value={limitType} onChange={(e) => setLimitType(e.target.value)}>
                <option value="total">{b.kindTotal}</option>
                <option value="category">{b.kindByCat}</option>
              </select>
            </div>
            {limitType === "category" && (
              <div className="field">
                <label>{b.category}</label>
                <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)}>
                  {BUDGETS.map((row) => (
                    <option key={row.id} value={String(row.id)}>
                      {row.icon} {row.name}
                    </option>
                  ))}
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
                  <b>{fmt(r.cur)}</b> / {fmt(r.tot)}
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