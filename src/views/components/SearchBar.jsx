import { useState, useRef, useEffect } from "react";
import { Icon } from "./icons";
import { TXNS } from "../../models/transactionsData";
import { getBudgetRows } from "../../models/budgetsData";

// Tìm kiếm cả GIAO DỊCH và HẠN MỨC, hiện kết quả ngay trong dropdown.
// KHÔNG chuyển trang khi chọn — chỉ điền vào ô tìm kiếm.
// Style nhúng sẵn để không phụ thuộc file CSS ngoài.

const POP_CSS = `
.search-pop {
  background: var(--pop-bg, #191a2e);
  border: 1px solid var(--border-strong, var(--border));
  border-radius: var(--r-lg);
  box-shadow: 0 20px 55px rgba(0,0,0,.5);
}
[data-theme="glass"] .search-pop { --pop-bg: #191a2e; }
[data-theme="neu"] .search-pop {
  --pop-bg: #eef0f6;
  box-shadow: 9px 9px 24px #c6cad6, -9px -9px 24px #ffffff;
  border-color: rgba(0,0,0,.06);
}
.sp-row {
  display: flex;
  align-items: center;
  gap: 11px;
  padding: 9px 10px;
  border-radius: var(--r-sm);
  font-size: .86rem;
  cursor: pointer;
  position: relative;
  transition: background .12s ease;
}
.sp-row:hover, .sp-row.on {
  background: color-mix(in srgb, var(--accent) 16%, transparent);
}
.sp-row.on::before {
  content: "";
  position: absolute;
  left: 0; top: 6px; bottom: 6px;
  width: 3px;
  border-radius: 3px;
  background: var(--accent);
}
.sp-row.on b { color: var(--text); }
.sp-group {
  font-size: .64rem;
  letter-spacing: .12em;
  color: var(--text-faint);
  padding: 9px 10px 6px;
}
.scroll-hide { scrollbar-width: none; -ms-overflow-style: none; }
.scroll-hide::-webkit-scrollbar { display: none; width: 0; height: 0; }
`;

const swatch = {
  width: "30px",
  height: "30px",
  flex: "0 0 auto",
  borderRadius: "9px",
  display: "grid",
  placeItems: "center",
  fontSize: ".9rem",
};

export default function SearchBar({ query, onSearch, t }) {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const inputRef = useRef(null);
  const boxRef = useRef(null);

  const s = t.searchbar;
  const q = query.trim().toLowerCase();
  const BUDGETS = getBudgetRows(t);

  const txHits = q
    ? TXNS.filter(
        (x) =>
          x.name.toLowerCase().includes(q) ||
          t.cats[x.catKey].toLowerCase().includes(q) ||
          t.methods[x.mkey].toLowerCase().includes(q) ||
          x.amount.toLowerCase().includes(q) ||
          x.date.includes(q),
      ).slice(0, 4)
    : [];

  const wantAllBudgets = q && t.nav.budgets.toLowerCase().includes(q);
  const budgetHits = q
    ? BUDGETS.filter(
        (b) => wantAllBudgets || b.name.toLowerCase().includes(q),
      ).slice(0, 4)
    : [];

  const flat = [
    ...txHits.map((x) => ({ kind: "tx", data: x })),
    ...budgetHits.map((x) => ({ kind: "budget", data: x })),
  ];

  useEffect(() => {
    function onKey(e) {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        inputRef.current?.focus();
        setOpen(true);
      }
      if (e.key === "Escape") {
        setOpen(false);
        inputRef.current?.blur();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    function onOutside(e) {
      if (boxRef.current && !boxRef.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", onOutside);
    return () => document.removeEventListener("mousedown", onOutside);
  }, []);

  function onKeyDown(e) {
    if (!open || flat.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((i) => (i + 1) % flat.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((i) => (i - 1 + flat.length) % flat.length);
    } else if (e.key === "Enter" && active >= 0) {
      e.preventDefault();
      pick(flat[active]);
    }
  }

  // Chọn kết quả: chỉ điền vào ô tìm kiếm, KHÔNG chuyển trang.
  function pick(item) {
    onSearch(item.kind === "budget" ? item.data.name : item.data.name);
    setOpen(false);
    setActive(-1);
  }

  function clear() {
    onSearch("");
    setActive(-1);
    inputRef.current?.focus();
  }

  return (
    <div ref={boxRef} style={{ position: "relative" }}>
      <style>{POP_CSS}</style>

      <div className="search">
        <Icon n="i-search" size={16} />
        <input
          ref={inputRef}
          placeholder={t.search}
          value={query}
          onChange={(e) => {
            onSearch(e.target.value);
            setOpen(true);
            setActive(-1);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={onKeyDown}
        />

        {query ? (
          <button
            onClick={clear}
            aria-label={s.clear}
            title={s.clear}
            style={{
              width: "22px",
              height: "22px",
              flex: "0 0 auto",
              borderRadius: "50%",
              border: "none",
              background: "var(--surface-2)",
              color: "var(--text-dim)",
              cursor: "pointer",
              display: "grid",
              placeItems: "center",
              fontSize: ".8rem",
              lineHeight: 1,
            }}
          >
            ✕
          </button>
        ) : (
          <kbd
            style={{
              flex: "0 0 auto",
              padding: "3px 7px",
              borderRadius: "6px",
              border: "1px solid var(--border)",
              background: "var(--surface-2)",
              color: "var(--text-faint)",
              fontSize: ".68rem",
              fontFamily: "inherit",
              whiteSpace: "nowrap",
            }}
          >
            Ctrl + K
          </kbd>
        )}
      </div>

      {open && q && (
        <div
          className="search-pop scroll-hide"
          style={{
            position: "absolute",
            top: "calc(100% + 8px)",
            left: 0,
            right: 0,
            zIndex: 90,
            padding: "4px 8px 8px",
            maxHeight: "340px",
            overflowY: "auto",
            animation: "fade .16s ease",
          }}
        >
          {flat.length === 0 && (
            <div
              style={{
                padding: "20px 10px",
                textAlign: "center",
                fontSize: ".82rem",
                color: "var(--text-dim)",
              }}
            >
              {s.noResult}
            </div>
          )}

          {txHits.length > 0 && (
            <>
              <div className="sp-group">{s.gTransactions}</div>
              {txHits.map((x, i) => (
                <div
                  key={"tx" + x.id}
                  className={"sp-row" + (active === i ? " on" : "")}
                  onMouseEnter={() => setActive(i)}
                  onClick={() => pick({ kind: "tx", data: x })}
                >
                  <span className={"cat " + x.cls} style={swatch}>
                    {x.icon}
                  </span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <b style={{ display: "block", fontWeight: 500 }}>{x.name}</b>
                    <small
                      style={{ fontSize: ".72rem", color: "var(--text-dim)" }}
                    >
                      {x.date} · {t.cats[x.catKey]}
                    </small>
                  </div>
                  <span
                    className={"amt " + x.type}
                    style={{ fontSize: ".82rem", whiteSpace: "nowrap" }}
                  >
                    {x.amount}
                  </span>
                </div>
              ))}
            </>
          )}

          {budgetHits.length > 0 && (
            <>
              <div className="sp-group">{s.gBudgets}</div>
              {budgetHits.map((b, j) => {
                const i = txHits.length + j;
                return (
                  <div
                    key={"bg" + b.id}
                    className={"sp-row" + (active === i ? " on" : "")}
                    onMouseEnter={() => setActive(i)}
                    onClick={() => pick({ kind: "budget", data: b })}
                  >
                    <span className={"cat " + b.cls} style={swatch}>
                      {b.icon}
                    </span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <b style={{ display: "block", fontWeight: 500 }}>
                        {b.name}
                      </b>
                      <small
                        style={{ fontSize: ".72rem", color: "var(--text-dim)" }}
                      >
                        {b.cur} / {b.tot} ₫
                      </small>
                    </div>
                    <span
                      className={"badge " + (b.badge === "dim" ? "" : b.badge)}
                      style={
                        b.badge === "dim"
                          ? {
                              background: "var(--surface-2)",
                              color: "var(--text-dim)",
                            }
                          : undefined
                      }
                    >
                      {b.pct}%
                    </span>
                  </div>
                );
              })}
            </>
          )}
        </div>
      )}
    </div>
  );
}