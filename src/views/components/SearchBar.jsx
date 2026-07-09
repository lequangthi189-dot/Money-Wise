import { useState, useRef, useEffect } from "react";
import { Icon } from "./icons";
import { TXNS, BUDGETS } from "../../models/data";

// Tìm kiếm cả GIAO DỊCH và HẠN MỨC. Chọn kết quả -> nhảy tới đúng trang.
// Màu lấy từ biến theme, không hardcode.

export default function SearchBar({ query, onSearch, setView, t }) {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const inputRef = useRef(null);
  const boxRef = useRef(null);

  const s = t.searchbar;
  const q = query.trim().toLowerCase();

  // --- Kết quả giao dịch ---
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

  // --- Kết quả hạn mức ---
  // Gõ đúng chữ "hạn mức" thì hiện tất cả; ngược lại lọc theo tên danh mục.
  const wantAllBudgets = q && t.nav.budgets.toLowerCase().includes(q);
  const budgetHits = q
    ? BUDGETS.filter(
        (b) => wantAllBudgets || t.cats[b.catKey].toLowerCase().includes(q),
      ).slice(0, 4)
    : [];

  const flat = [
    ...txHits.map((x) => ({ kind: "tx", data: x })),
    ...budgetHits.map((x) => ({ kind: "budget", data: x })),
  ];

  // Ctrl+K focus, Esc đóng
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

  // Bấm ra ngoài thì đóng
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

  function pick(item) {
    setOpen(false);
    setActive(-1);
    if (item.kind === "budget") {
      onSearch(t.cats[item.data.catKey]);
      setView("budgets");
    } else {
      onSearch(item.data.name);
      setView("transactions");
    }
  }

  function clear() {
    onSearch("");
    setActive(-1);
    inputRef.current?.focus();
  }

  const rowStyle = (i) => ({
    display: "flex",
    alignItems: "center",
    gap: "11px",
    padding: "9px 10px",
    borderRadius: "var(--r-sm)",
    fontSize: ".86rem",
    cursor: "pointer",
    background: active === i ? "var(--surface-2)" : "transparent",
  });

  const groupLabel = {
    fontSize: ".64rem",
    letterSpacing: ".12em",
    color: "var(--text-faint)",
    padding: "8px 10px 6px",
  };

  return (
    <div ref={boxRef} style={{ position: "relative" }}>
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
          className="card glass scroll-hide"
          style={{
            position: "absolute",
            top: "calc(100% + 8px)",
            left: 0,
            right: 0,
            zIndex: 40,
            padding: "6px 8px 8px",
            maxHeight: "340px",
            overflowY: "auto",
            animation: "fade .16s ease",
          }}
        >
          {flat.length === 0 && (
            <div
              style={{
                padding: "18px 10px",
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
              <div style={groupLabel}>{s.gTransactions}</div>
              {txHits.map((x, i) => (
                <div
                  key={"tx" + x.id}
                  onMouseEnter={() => setActive(i)}
                  onClick={() => pick({ kind: "tx", data: x })}
                  style={rowStyle(i)}
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
              <div style={groupLabel}>{s.gBudgets}</div>
              {budgetHits.map((b, j) => {
                const i = txHits.length + j;
                return (
                  <div
                    key={"bg" + b.id}
                    onMouseEnter={() => setActive(i)}
                    onClick={() => pick({ kind: "budget", data: b })}
                    style={rowStyle(i)}
                  >
                    <span className={"cat " + b.cls} style={swatch}>
                      {b.icon}
                    </span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <b style={{ display: "block", fontWeight: 500 }}>
                        {t.cats[b.catKey]}
                      </b>
                      <small
                        style={{ fontSize: ".72rem", color: "var(--text-dim)" }}
                      >
                        {b.spent} / {b.limit} ₫
                      </small>
                    </div>
                    <span
                      className={
                        "badge " + (b.badge === "dim" ? "" : b.badge)
                      }
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

const swatch = {
  width: "30px",
  height: "30px",
  flex: "0 0 auto",
  borderRadius: "9px",
  display: "grid",
  placeItems: "center",
  fontSize: ".9rem",
};