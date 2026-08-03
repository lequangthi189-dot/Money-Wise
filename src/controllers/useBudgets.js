import { useMemo, useState } from "react";
import { useAppData } from "../context/AppDataContext";

function classify(pct) {
  if (pct >= 95) return { bar: "danger", badge: "b-out" };
  if (pct >= 80) return { bar: "warn", badge: "b-warn" };
  if (pct < 30) return { bar: "ok", badge: "b-in" };
  return { bar: "", badge: "dim" };
}

const fmt = (n) => Math.round(n).toLocaleString("vi-VN");
const parseAmount = (s) => Number(String(s).replace(/[^\d]/g, "")) || 0;

export function useBudgets(t) {
  const {
    categories,
    budgets,
    transactions,
    setCategoryBudget,
    setTotalLimit,
  } = useAppData();

  const [limitInput, setLimitInput] = useState("");
  // Key ổn định ("total" | "category") độc lập với ngôn ngữ hiển thị,
  // tránh vỡ logic khi người dùng đổi ngôn ngữ giữa chừng.
  const [limitType, setLimitType] = useState("total");
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [categoryLimit, setCategoryLimit] = useState("");
  const [showForm, setShowForm] = useState(false);

  const expenseCategories = useMemo(
    () => categories.filter((c) => c.type === "out"),
    [categories]
  );

  // Mặc định chọn danh mục chi đầu tiên cho tới khi người dùng tự chọn.
  // Derive tại chỗ thay vì setState trong effect (tránh cascading render).
  const effectiveCategory =
    selectedCategory ?? expenseCategories[0]?.id ?? null;

  const spentByCategory = useMemo(() => {
    const map = {};
    transactions
      .filter((tx) => tx.type === "out")
      .forEach((tx) => {
        map[tx.categoryId] = (map[tx.categoryId] || 0) + tx.amount;
      });
    return map;
  }, [transactions]);

  const budgetRows = useMemo(() => {
    return expenseCategories
      .map((cat) => {
        const budget = budgets.find((b) => b.categoryId === cat.id);
        if (!budget) return null;
        const spent = spentByCategory[cat.id] || 0;
        const pct =
          budget.limit > 0 ? Math.round((spent / budget.limit) * 100) : 0;
        const { bar, badge } = classify(pct);
        return {
          id: cat.id,
          icon: cat.icon,
          cls: cat.cls,
          catKey: cat.key,
          name: cat.name || t.cats[cat.key],
          cur: fmt(spent),
          tot: fmt(budget.limit),
          pct,
          bar,
          badge,
        };
      })
      .filter(Boolean);
  }, [expenseCategories, budgets, spentByCategory, t]);

  const totalLimit = useMemo(
    () => budgets.find((b) => b.categoryId === "TOTAL")?.limit || 0,
    [budgets]
  );
  const totalSpent = useMemo(
    () => Object.values(spentByCategory).reduce((a, b) => a + b, 0),
    [spentByCategory]
  );
  const totalPct =
    totalLimit > 0 ? Math.round((totalSpent / totalLimit) * 100) : 0;
  const totalLeft = totalLimit - totalSpent;

  const handleSaveLimit = () => {
    const amount = parseAmount(limitInput);
    if (!amount) return;
    if (limitType === "total") {
      setTotalLimit(amount);
    } else if (effectiveCategory != null) {
      setCategoryBudget(effectiveCategory, amount);
    }
    setLimitInput("");
  };

  const handleSaveCategoryBudget = (categoryId, amount) => {
    setCategoryBudget(categoryId, parseAmount(amount));
  };

  const handleEditBudget = (categoryId, amount) => {
    setCategoryBudget(categoryId, parseAmount(amount));
  };

  return {
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
    showForm,
    setShowForm,
    selectedCategory: effectiveCategory,
    setSelectedCategory,
    categoryLimit,
    setCategoryLimit,
    handleSaveCategoryBudget,
    handleEditBudget,
    expenseCategories,
  };
}