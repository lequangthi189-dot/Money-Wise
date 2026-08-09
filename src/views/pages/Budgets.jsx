import { useEffect, useMemo, useRef, useState } from "react";
import {
  getBudgetRows,
  fetchBudgetConfig,
  fetchBudgetState,
  saveBudgetLimit,
} from "../../models/budgetsData";
import { fetchCategories } from "../../models/danhMucData";

function BudgetSelect({ value, onChange, label, options }) {
  const menuRef = useRef(null);
  const selected = options.find((option) => option.value === value) ?? options[0];

  function select(nextValue) {
    onChange(nextValue);
    menuRef.current?.removeAttribute("open");
  }

  return (
    <details className="budget-kind-select" ref={menuRef}>
      <summary aria-label={label}>{selected.label}</summary>
      <div className="budget-kind-menu" role="listbox" aria-label={label}>
        {options.map((option) => (
          <button
            key={option.value}
            type="button"
            role="option"
            aria-selected={option.value === value}
            className={option.value === value ? "selected" : ""}
            onClick={() => select(option.value)}
          >
            {option.label}
          </button>
        ))}
      </div>
    </details>
  );
}

export default function Budgets({ query = "", t, userId, onDataChanged }) {
  const b = t.budgets;
  const q = query.trim().toLowerCase();
  const [categories, setCategories] = useState([]);
  const [budgetState, setBudgetState] = useState({ totalLimit: 0, totalSpent: 0, categoryLimits: {} });
  const [budgetConfig, setBudgetConfig] = useState(null);
  const [limitType, setLimitType] = useState("total");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [limitInput, setLimitInput] = useState("");
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const today = new Date();
    return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}`;
  });
  const BUDGETS = useMemo(() => getBudgetRows(t, categories, budgetState, budgetConfig), [t, categories, budgetState, budgetConfig]);
  const currentMonth = selectedMonth.split("-").reverse().join("/");
  const maxMonth = (() => {
    const today = new Date();
    return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}`;
  })();

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

    fetchBudgetConfig().then((config) => alive && setBudgetConfig(config)).catch(() => {});

    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    let alive = true;
    fetchBudgetState(selectedMonth)
      .then((state) => alive && setBudgetState(state))
      .catch(() => alive && setBudgetState({ totalLimit: 0, totalSpent: 0, categoryLimits: {} }));
    return () => { alive = false; };
  }, [selectedMonth]);

  const fmt = (n) => Number(n).toLocaleString("vi-VN") + " ₫";
  const totalLimit = Number(budgetState.totalLimit) || 0;
  const totalSpent = Number(budgetState.totalSpent) || 0;
  const totalPct = totalLimit > 0 ? Math.round((totalSpent / totalLimit) * 100) : 0;
  const totalLeft = totalLimit - totalSpent;

  async function handleSaveLimit() {
    const value = Number(limitInput.replaceAll(".", "").replaceAll(",", ""));

    if (Number.isNaN(value) || value <= 0) {
      alert(b.invalidLimit);
      return;
    }

    const nextState = { ...budgetState };

    if (limitType === "total") {
      const categoryTotal = Object.values(nextState.categoryLimits || {}).reduce(
        (sum, item) => sum + Number(item?.tot || 0),
        0,
      );
      if (value < categoryTotal) {
        alert(b.totalBelowCategories);
        return;
      }
      nextState.totalLimit = value;
    } else {
      if (!selectedCategory) {
        alert(b.selectCategory);
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
        alert(b.categoriesOverTotal);
        return;
      }

      nextState.categoryLimits = nextCategoryLimits;
    }

    try {
      const savedState = await saveBudgetLimit(userId, limitType, selectedCategory, value, selectedMonth);
      setBudgetState(savedState);
      setLimitInput(value.toLocaleString("vi-VN"));
      await onDataChanged?.();
    } catch (error) {
      alert(error.message);
    }
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
          <div className="field budget-month-field">
            <label>{b.selectMonth}</label>
            <input type="month" max={maxMonth} value={selectedMonth} onChange={(event) => { setSelectedMonth(event.target.value); setLimitInput(""); }} />
          </div>
          <div className="card glass" style={{ marginBottom: "18px" }}>
            <div className="card-h">
              <h3>{b.totalTitle(currentMonth)}</h3>
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
                  "bar " + (budgetConfig && totalPct >= budgetConfig.danger ? "danger" : budgetConfig && totalPct >= budgetConfig.warning ? "warn" : "")
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
              <BudgetSelect
                value={limitType}
                onChange={setLimitType}
                label={b.kind}
                options={[{ value: "total", label: b.kindTotal }, { value: "category", label: b.kindByCat }]}
              />
            </div>
            {limitType === "category" && (
              <div className="field">
                <label>{b.category}</label>
                <BudgetSelect value={selectedCategory} onChange={setSelectedCategory} label={b.category} options={BUDGETS.map((row) => ({ value: String(row.id), label: `${row.icon} ${row.name}` }))} />
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
