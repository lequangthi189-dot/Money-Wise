import { useMemo } from "react";
import { useAppData } from "../context/AppDataContext";

const COLORS = ["#f87171", "#60a5fa", "#fbbf24", "#a78bfa", "#34d399", "#f472b6", "#38bdf8"];
const fmtVND = (n) => `${Math.round(n).toLocaleString("vi-VN")} ₫`;
const monthKey = (offset = 0) => {
  const date = new Date();
  date.setMonth(date.getMonth() + offset, 1);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
};
const percentChange = (current, previous) => previous === 0 ? null : Math.round(((current - previous) / Math.abs(previous)) * 1000) / 10;

export function useDashboard(t, streakData) {
  const { categories, transactions, goals, budgets } = useAppData();
  const d = t.dashboard;
  const currentMonth = monthKey();
  const monthlyTransactions = useMemo(() => transactions.filter((tx) => tx.dateISO?.slice(0, 7) === currentMonth), [transactions, currentMonth]);
  const spendingByCategory = useMemo(() => {
    const map = {};
    monthlyTransactions.filter((tx) => tx.type === "out").forEach((tx) => { map[tx.categoryId] = (map[tx.categoryId] || 0) + Number(tx.amount); });
    return categories.filter((cat) => cat.type === "out" && map[cat.id]).map((cat) => ({ cat, amount: map[cat.id] })).sort((a, b) => b.amount - a.amount);
  }, [categories, monthlyTransactions]);
  const totalSpent = useMemo(() => spendingByCategory.reduce((sum, row) => sum + row.amount, 0), [spendingByCategory]);
  const donut = useMemo(() => spendingByCategory.slice(0, 5).reduce((result, row, index) => {
    const pct = totalSpent > 0 ? row.amount / totalSpent * 100 : 0;
    const offset = result.reduce((sum, segment) => sum + segment.pct, 0);
    return [...result, { pct, color: COLORS[index % COLORS.length], dash: `${pct.toFixed(2)} ${(100 - pct).toFixed(2)}`, off: String(-offset) }];
  }, []), [spendingByCategory, totalSpent]);
  const legend = spendingByCategory.slice(0, 5).map((row, index) => ({ c: COLORS[index % COLORS.length], name: row.cat.name, v: fmtVND(row.amount) }));
  const goalRows = goals.map((goal) => {
    const current = Number(goal.tong_so_du_thuc_te || 0);
    const target = Number(goal.so_tien_muc_tieu || 0);
    const pct = target > 0 ? Math.min(100, Math.round(current / target * 100)) : 0;
    return { icon: "🎯", name: goal.ten_muc_tieu, pct, bar: pct >= 50 ? "ok" : "", cur: current.toLocaleString("vi-VN"), tot: target.toLocaleString("vi-VN") };
  });
  const recent = useMemo(() => [...transactions].sort((a, b) => String(b.dateISO).localeCompare(String(a.dateISO)) || Number(b.id) - Number(a.id)).slice(0, 6).map((tx) => {
    const cat = categories.find((item) => item.id === tx.categoryId);
    const when = tx.daysAgo === 0 ? d.today : tx.daysAgo === 1 ? d.yesterday : `${tx.daysAgo} ${d.daysAgoLabel || "ngày trước"}`;
    return { icon: cat?.icon || "💸", cls: cat?.cls || "", name: tx.note || cat?.name || "Giao dịch", when, mkey: tx.method, type: tx.type, amt: `${tx.type === "in" ? "+" : "-"}${Number(tx.amount).toLocaleString("vi-VN")} ₫` };
  }), [transactions, categories, d]);
  const spentToday = monthlyTransactions.filter((tx) => tx.type === "out" && tx.daysAgo === 0).reduce((sum, tx) => sum + Number(tx.amount), 0);
  const txCountToday = monthlyTransactions.filter((tx) => tx.daysAgo === 0).length;
  const spentWeek = transactions.filter((tx) => tx.type === "out" && tx.daysAgo <= 6).reduce((sum, tx) => sum + Number(tx.amount), 0);
  const balance = transactions.reduce((sum, tx) => sum + (tx.type === "in" ? Number(tx.amount) : -Number(tx.amount)), 0);
  const netForMonth = (key) => transactions.filter((tx) => tx.dateISO?.slice(0, 7) === key)
    .reduce((sum, tx) => sum + (tx.type === "in" ? Number(tx.amount) : -Number(tx.amount)), 0);
  const previousMonthNet = netForMonth(monthKey(-1));
  const currentMonthNet = netForMonth(currentMonth);
  const previousWeekSpent = transactions.filter((tx) => tx.type === "out" && tx.daysAgo >= 7 && tx.daysAgo <= 13)
    .reduce((sum, tx) => sum + Number(tx.amount), 0);
  const balanceChange = percentChange(currentMonthNet, previousMonthNet);
  const weekChange = percentChange(spentWeek, previousWeekSpent);
  const budgetAlert = budgets.filter((budget) => budget.categoryId !== "TOTAL" && budget.limit > 0).map((budget) => {
    const spent = spendingByCategory.find((row) => row.cat.id === budget.categoryId)?.amount ?? budget.spent ?? 0;
    return { name: categories.find((item) => item.id === budget.categoryId)?.name || "Danh mục", pct: Math.round(spent / budget.limit * 100), left: budget.limit - spent };
  }).filter((item) => item.pct >= 80).sort((a, b) => b.pct - a.pct)[0] ?? null;
  return { legend, donut, goals: goalRows, recent, budgetAlert, balanceChange, weekChange, totalSpentLabel: `${(totalSpent / 1_000_000).toFixed(2).replace(".", ",")}tr`, spentToday, spentWeek, txCountToday, balance, streak: streakData?.ghiChep?.current ?? 0, streakRecord: streakData?.ghiChep?.record ?? 0 };
}
