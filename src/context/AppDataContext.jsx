/* eslint-disable react-refresh/only-export-components */
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import * as categoryService from "../services/categoryService";
import * as budgetService from "../services/budgetService";
import * as transactionService from "../services/transactionService";
import * as goalService from "../services/goalService";
import * as settingsService from "../services/settingsService";
import { supabase } from "../models/supabase";

const AppDataContext = createContext(null);

export function AppDataProvider({ children }) {
  const [categories, setCategories] = useState([]);
  const [budgets, setBudgets] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [goals, setGoals] = useState([]);
  const [settings, setSettings] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const results = await Promise.allSettled([
        categoryService.fetchCategories(),
        budgetService.fetchBudgets(),
        transactionService.fetchTransactions(),
        goalService.fetchGoals(),
        settingsService.fetchSettings(),
      ]);
      const setters = [setCategories, setBudgets, setTransactions, setGoals, setSettings];
      results.forEach((result, index) => {
        if (result.status === "fulfilled") setters[index](result.value);
      });
      const failed = results.find((result) => result.status === "rejected");
      if (failed) setError(failed.reason);
    } catch (e) {
      setError(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const { data } = supabase.auth.onAuthStateChange((event, session) => {
      if ((event === "SIGNED_IN" || event === "INITIAL_SESSION") && session) {
        setTimeout(loadAll, 0);
        return;
      }

      if (event === "SIGNED_OUT" || (event === "INITIAL_SESSION" && !session)) {
        setCategories([]);
        setBudgets([]);
        setTransactions([]);
        setGoals([]);
        setSettings({});
        setError(null);
        setLoading(false);
      }
    });
    return () => {
      data.subscription.unsubscribe();
    };
  }, [loadAll]);

  const addCategory = useCallback(async (data) => {
    const row = await categoryService.createCategory(data);
    setCategories((prev) => [...prev, row]);
    if (row.type === "out") {
      const rows = await budgetService.saveCategoryLimit(row.id, 0);
      setBudgets(rows);
    }
    return row;
  }, []);

  const updateCategory = useCallback(async (id, patch) => {
    const row = await categoryService.editCategory(id, patch);
    setCategories((prev) => prev.map((c) => (c.id === id ? row : c)));
    return row;
  }, []);

  const deleteCategory = useCallback(async (id) => {
    await categoryService.removeCategory(id);
    setCategories((prev) => prev.filter((c) => c.id !== id));
    setBudgets((prev) => prev.filter((b) => b.categoryId !== id));
  }, []);

  const setCategoryBudget = useCallback(async (categoryId, limit) => {
    const rows = await budgetService.saveCategoryLimit(categoryId, limit);
    setBudgets(rows);
  }, []);

  const setTotalLimit = useCallback(async (limit) => {
    const rows = await budgetService.saveTotalLimit(limit);
    setBudgets(rows);
  }, []);

  const addTransaction = useCallback(async (tx) => {
    const row = await transactionService.createTransaction(tx);
    setTransactions((prev) => [...prev, row]);
    return row;
  }, []);

  const value = useMemo(
    () => ({
      categories,
      budgets,
      transactions,
      goals,
      settings,
      loading,
      error,
      reload: loadAll,
      addCategory,
      updateCategory,
      deleteCategory,
      setCategoryBudget,
      setTotalLimit,
      addTransaction,
    }),
    [
      categories,
      budgets,
      transactions,
      goals,
      settings,
      loading,
      error,
      loadAll,
      addCategory,
      updateCategory,
      deleteCategory,
      setCategoryBudget,
      setTotalLimit,
      addTransaction,
    ]
  );

  return (
    <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>
  );
}

export function useAppData() {
  const ctx = useContext(AppDataContext);
  if (!ctx) {
    throw new Error("useAppData phải được gọi bên trong <AppDataProvider>");
  }
  return ctx;
}
