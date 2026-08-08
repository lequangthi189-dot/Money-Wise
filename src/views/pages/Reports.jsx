import { useEffect, useMemo, useState } from "react";
import { useAppData } from "../../context/AppDataContext";
import { PIE_COLORS } from "../../models/reportsData";

export default function Reports({ t, lang }) {
  const { categories = [], transactions = [] } = useAppData();
  const r = t.reports;
  const [monthIndex, setMonthIndex] = useState(0);
  const [today, setToday] = useState(new Date());
  const locale = lang === "vi" ? "vi-VN" : "en-US";

  useEffect(() => {
    const interval = setInterval(() => setToday(new Date()), 60_000);
    return () => clearInterval(interval);
  }, []);

  const monthOpts = useMemo(() => {
    const labels = [];
    for (let offset = 0; offset < 2; offset += 1) {
      const date = new Date(today.getFullYear(), today.getMonth() - offset, 1);
      labels.push(date.toLocaleString(locale, { month: "long", year: "numeric" }));
    }
    return labels;
  }, [locale, today]);

  const selectedMonthDate = useMemo(
    () => new Date(today.getFullYear(), today.getMonth() - monthIndex, 1),
    [today, monthIndex]
  );

  const enrichedTransactions = useMemo(
    () =>
      transactions.map((tx) => {
        // Dữ liệu hiện tại dùng dateISO; daysAgo được giữ để tương thích dữ liệu mẫu cũ.
        const date = tx.dateISO ? new Date(`${tx.dateISO}T00:00:00`) : new Date(today);
        if (!tx.dateISO) date.setDate(date.getDate() - Number(tx.daysAgo || 0));
        return { ...tx, amount: Number(tx.amountRaw ?? tx.amount) || 0, date };
      }),
    [transactions, today]
  );

  const selectedMonthTransactions = useMemo(
    () =>
      enrichedTransactions.filter(
        (tx) =>
          tx.date.getFullYear() === selectedMonthDate.getFullYear() &&
          tx.date.getMonth() === selectedMonthDate.getMonth()
      ),
    [enrichedTransactions, selectedMonthDate]
  );

  const totalIn = useMemo(
    () =>
      selectedMonthTransactions
        .filter((tx) => tx.type === "in")
        .reduce((sum, tx) => sum + tx.amount, 0),
    [selectedMonthTransactions]
  );

  const totalOut = useMemo(
    () =>
      selectedMonthTransactions
        .filter((tx) => tx.type === "out")
        .reduce((sum, tx) => sum + tx.amount, 0),
    [selectedMonthTransactions]
  );

  const currentMonthLabel = monthOpts[monthIndex] ?? "";

  const categorySpending = useMemo(() => {
    const map = {};
    selectedMonthTransactions
      .filter((tx) => tx.type === "out")
      .forEach((tx) => {
        map[tx.categoryId] = (map[tx.categoryId] || 0) + tx.amount;
      });

    const rows = categories
      .filter((cat) => cat.type === "out")
      .map((cat) => ({
        id: cat.id,
        name: t.cats[cat.key] || cat.name,
        amount: map[cat.id] || 0,
      }))
      .sort((a, b) => b.amount - a.amount);

    const top = rows.slice(0, 4);
    const otherAmount = rows.slice(4).reduce((sum, row) => sum + row.amount, 0);
    if (otherAmount > 0) {
      top.push({
        id: "other",
        name: t.cats?.other || "Khác",
        amount: otherAmount,
      });
    }
    return top;
  }, [categories, selectedMonthTransactions, t]);

  const pie = useMemo(() => {
    if (totalOut === 0) {
      return [
        { c: PIE_COLORS[0], name: t.cats.food, v: "0%" },
        { c: PIE_COLORS[1], name: t.cats.move, v: "0%" },
        { c: PIE_COLORS[2], name: t.cats.fun, v: "0%" },
        { c: PIE_COLORS[3], name: t.cats.other, v: "0%" },
      ];
    }
    return categorySpending.map((item, i) => ({
      c: PIE_COLORS[i % PIE_COLORS.length],
      name: item.name,
      v: `${Math.round((item.amount / totalOut) * 100)}%`,
    }));
  }, [categorySpending, totalOut, t]);

  const pieSegments = useMemo(
    () =>
      pie.map((item, index) => {
      const value = Number.parseFloat(item.v) || 0;
      const offset = pie
        .slice(0, index)
        .reduce((sum, previous) => sum + (Number.parseFloat(previous.v) || 0), 0);
      return { ...item, dash: `${value} ${100 - value}`, offset: -offset };
      }),
    [pie]
  );
  const pieRing = pieSegments.map((segment) => segment.dash);
  const pieColors = pieSegments.map((segment) => segment.c);
  const pieOff = pieSegments.map((segment) => segment.offset);

  const months6 = useMemo(() => {
    const labels = [];
    const totals = [];
    for (let i = 5; i >= 0; i -= 1) {
      const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
      labels.push(date.toLocaleString(locale, { month: "short" }));
      totals.push(
        enrichedTransactions
          .filter(
            (tx) =>
              tx.date.getFullYear() === date.getFullYear() &&
              tx.date.getMonth() === date.getMonth() &&
              tx.type === "out"
          )
          .reduce((sum, tx) => sum + tx.amount, 0)
      );
    }
    return { labels, totals };
  }, [enrichedTransactions, locale, today]);

  const maxMonthValue = Math.max(...months6.totals, 1);
  const barHeights = months6.totals.map((value) =>
    `${Math.max(12, Math.round((value / maxMonthValue) * 100))}%`
  );
  const last6Months = months6.labels;
  const BARS = barHeights.map((h, index) => ({
    h,
    grad:
      index === barHeights.length - 1
        ? "linear-gradient(180deg,var(--accent-2),rgba(34,211,238,.3))"
        : undefined,
  }));

  const linePoints = months6.totals
    .map((value, index) => {
      const x = 10 + index * 100;
      const y = 150 - Math.round((value / maxMonthValue) * 110);
      return `${x},${y}`;
    })
    .join(" ");
  const lineFillPoints = `${linePoints} 510,170 10,170`;
  const lineXPositions = [10, 110, 210, 310, 410, 510];

  return (
    <>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "12px",
          marginBottom: "18px",
        }}
      >
        <select
          style={{ width: "auto" }}
          value={monthIndex}
          onChange={(e) => setMonthIndex(Number(e.target.value))}
        >
          {monthOpts.map((m, i) => (
            <option key={i} value={i}>
              {m}
            </option>
          ))}
        </select>
        <div style={{ flex: "1" }}></div>
        <button className="btn">
          <svg
            width="16"
            height="16"
            style={{ verticalAlign: "-3px", marginRight: "5px" }}
          >
            <use href="#i-copy" />
          </svg>
          {r.makeShare}
        </button>
      </div>

      <div className="grid g-3">
        <div className="stat glass" aria-label={`${r.totalIn}: ${totalIn}`}>
          <div className="row">
            <label>{r.totalIn}</label>
            <div className="ico ico-ok">
              <svg>
                <use href="#i-chart" />
              </svg>
            </div>
          </div>
          <div className="val sm" style={{ color: "var(--ok)" }}>
            5.500.000 ₫
          </div>
        </div>
        <div className="stat glass">
          <div className="row">
            <label>{r.totalOut}</label>
            <div className="ico ico-warn">
              <svg>
                <use href="#i-swap" />
              </svg>
            </div>
          </div>
          <div className="val sm" style={{ color: "var(--danger)" }}>
            2.180.000 ₫
          </div>
        </div>
        <div className="stat glass">
          <div className="row">
            <label>{r.endBalance}</label>
            <div className="ico ico-pri">
              <svg>
                <use href="#i-wallet" />
              </svg>
            </div>
          </div>
          <div className="val sm">3.320.000 ₫</div>
        </div>
      </div>

      <div className="grid g-2" style={{ marginTop: "18px" }}>
        <div className="card glass">
          <div className="card-h">
            <h3>{r.structure}</h3>
            <span className="muted">{currentMonthLabel} · {r.pieChart}</span>
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
                {pieRing.map((dash, i) => (
                  <circle
                    key={i}
                    cx="21"
                    cy="21"
                    r="15.9"
                    fill="none"
                    stroke={pieColors[i]}
                    strokeWidth="5"
                    strokeDasharray={dash}
                    strokeDashoffset={pieOff[i]}
                    transform="rotate(-90 21 21)"
                  />
                ))}
              </svg>
              <div className="center">
                <b>2.18tr</b>
                <small>{r.totalSpent}</small>
              </div>
            </div>
            <div className="legend">
              {pie.map((l, i) => (
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
            <h3>{r.compare6}</h3>
            <span className="muted">{r.barChart}</span>
          </div>
          <div className="barchart">
            {BARS.map((bar, i) => (
              <div className="col" key={i}>
                <div
                  className="bw"
                  style={{ height: bar.h, background: bar.grad || undefined }}
                ></div>
                <small>{last6Months[i]}</small>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="card glass" style={{ marginTop: "18px" }}>
        <div className="card-h">
          <h3>{r.trend}</h3>
          <span className="muted">{r.lineChart}</span>
        </div>
        <svg
          width="100%"
          height="200"
          viewBox="0 0 600 200"
          preserveAspectRatio="none"
          style={{ overflow: "visible" }}
        >
          <polyline
            fill="none"
            stroke="var(--accent)"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            points={linePoints + " 590,40"}
          />
          <polyline
            fill="url(#fillgrad)"
            stroke="none"
            points={lineFillPoints + " 590,170 10,170"}
          />
          {lineXPositions.map((x, idx) => (
            <text
              key={idx}
              x={x}
              y="190"
              textAnchor="middle"
              fontSize="12"
              fill="var(--text-dim)"
            >
              {last6Months[idx]}
            </text>
          ))}
          <defs>
            <linearGradient id="fillgrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.25" />
              <stop offset="100%" stopColor="var(--accent)" stopOpacity="0" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      <div className="card glass" style={{ marginTop: "18px" }}>
        <div className="card-h">
          <h3>{r.shareTitle}</h3>
        </div>
        <p
          style={{
            fontSize: ".82rem",
            color: "var(--text-dim)",
            marginBottom: "8px",
          }}
        >
          {r.shareDesc}
        </p>
        <div className="sharebox">
          <svg width="18" height="18" style={{ color: "var(--text-dim)" }}>
            <use href="#i-percent" />
          </svg>
          <code>MW-2K6F-9X7A</code>
          <button className="btn" style={{ padding: "7px 12px" }}>
            <svg width="15" height="15" style={{ verticalAlign: "-2px" }}>
              <use href="#i-copy" />
            </svg>
          </button>
        </div>
      </div>
    </>
  );
}
