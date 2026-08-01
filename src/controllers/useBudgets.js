import { useEffect, useMemo, useState } from "react";
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
  const [limitType, setLimitType] = useState(t.budgets.kindTotal);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [categoryLimit, setCategoryLimit] = useState("");
  const [showForm, setShowForm] = useState(false);

  const expenseCategories = useMemo(
    () => categories.filter((c) => c.type === "out"),
    [categories]
  );

  useEffect(() => {
    if (selectedCategory === null && expenseCategories.length > 0) {
      setSelectedCategory(expenseCategories[0].id);
    }
  }, [expenseCategories, selectedCategory]);

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
    if (limitType === t.budgets.kindTotal) {
      setTotalLimit(amount);
    } else if (selectedCategory != null) {
      setCategoryBudget(selectedCategory, amount);
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
    selectedCategory,
    setSelectedCategory,
    categoryLimit,
    setCategoryLimit,
    handleSaveCategoryBudget,
    handleEditBudget,
    expenseCategories,
  };
}