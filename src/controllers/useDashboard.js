import { useMemo } from "react";
import { useAppData } from "../context/AppDataContext";

const COLORS = ["#f87171", "#60a5fa", "#fbbf24", "#a78bfa", "#34d399", "#f472b6", "#38bdf8"];
const fmtVND = (n) => Math.round(n).toLocaleString("vi-VN") + " ₫";

export function useDashboard(t) {
  const { categories, transactions, goals, settings } = useAppData();
  const d = t.dashboard;

  const spendingByCategory = useMemo(() => {
    const map = {};
    transactions
      .filter((tx) => tx.type === "out")
      .forEach((tx) => {
        map[tx.categoryId] = (map[tx.categoryId] || 0) + tx.amount;
      });
    return categories
      .filter((c) => c.type === "out" && map[c.id])
      .map((c) => ({ cat: c, amount: map[c.id] }))
      .sort((a, b) => b.amount - a.amount);
  }, [categories, transactions]);

  const totalSpent = useMemo(
    () => spendingByCategory.reduce((sum, r) => sum + r.amount, 0),
    [spendingByCategory]
  );

  const donut = useMemo(() => {
    let offset = 0;
    return spendingByCategory.slice(0, 5).map((row, i) => {
      const pct = totalSpent > 0 ? (row.amount / totalSpent) * 100 : 0;
      const seg = {
        color: COLORS[i % COLORS.length],
        dash: `${pct.toFixed(2)} ${(100 - pct).toFixed(2)}`,
        off: String(-offset),
      };
      offset += pct;
      return seg;
    });
  }, [spendingByCategory, totalSpent]);

  const legend = spendingByCategory.slice(0, 5).map((row, i) => ({
    c: COLORS[i % COLORS.length],
    name: row.cat.name || t.cats[row.cat.key],
    v: fmtVND(row.amount),
  }));

  const goalRows = goals.map((g) => ({
    icon: g.icon,
    name: t.goals[g.key],
    pct: g.tot > 0 ? Math.round((g.cur / g.tot) * 100) : 0,
    bar: g.tot > 0 && g.cur / g.tot >= 0.5 ? "ok" : "",
    cur: g.cur.toLocaleString("vi-VN"),
    tot: g.tot.toLocaleString("vi-VN"),
  }));

  const recent = useMemo(() => {
    return [...transactions]
      .sort((a, b) => a.daysAgo - b.daysAgo)
      .slice(0, 6)
      .map((tx) => {
        const cat = categories.find((c) => c.id === tx.categoryId);
        const when =
          tx.daysAgo === 0
            ? `${d.today} · ${tx.time || "--:--"}`
            : tx.daysAgo === 1
            ? d.yesterday
            : `${tx.daysAgo} ${d.daysAgoLabel || "ngày trước"}`;
        return {
          icon: cat?.icon || "💸",
          cls: cat?.cls || "",
          name: tx.note,
          when,
          mkey: tx.method,
          type: tx.type,
          amt: (tx.type === "in" ? "+" : "-") + tx.amount.toLocaleString("vi-VN") + " ₫",
        };
      });
  }, [transactions, categories, d]);

  const spentToday = useMemo(
    () =>
      transactions
        .filter((tx) => tx.type === "out" && tx.daysAgo === 0)
        .reduce((s, tx) => s + tx.amount, 0),
    [transactions]
  );
  const txCountToday = useMemo(
    () => transactions.filter((tx) => tx.daysAgo === 0).length,
    [transactions]
  );
  const spentWeek = useMemo(
    () =>
      transactions
        .filter((tx) => tx.type === "out" && tx.daysAgo <= 7)
        .reduce((s, tx) => s + tx.amount, 0),
    [transactions]
  );

  return {
    legend,
    donut,
    goals: goalRows,
    recent,
    totalSpentLabel: (totalSpent / 1_000_000).toFixed(2).replace(".", ",") + "tr",
    spentToday,
    spentWeek,
    txCountToday,
    balance: settings.balance || 0,
    streak: settings.streak || 0,
    streakRecord: settings.streakRecord || 0,
  };
}