import { fetchBudgetState, saveBudgetLimit } from "../models/budgetsData";
import { supabase } from "../models/supabase";

function rows(state) {
  return [
    { categoryId: "TOTAL", limit: state.totalLimit, spent: state.totalSpent },
    ...Object.entries(state.categoryLimits).map(([categoryId, value]) => ({
      categoryId: Number(categoryId), limit: value.tot, spent: value.cur,
    })),
  ];
}

export async function fetchBudgets() {
  return rows(await fetchBudgetState());
}

async function currentUserId() {
  const { data, error } = await supabase.auth.getUser();
  if (error) throw error;
  return data.user.id;
}

export async function saveCategoryLimit(categoryId, limit) {
  return rows(await saveBudgetLimit(await currentUserId(), "category", categoryId, limit));
}

export async function saveTotalLimit(limit) {
  return rows(await saveBudgetLimit(await currentUserId(), "total", null, limit));
}

export async function removeBudget(categoryId) {
  return saveCategoryLimit(categoryId, 0);
}
