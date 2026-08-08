import { fetchBudgetConfig, fetchBudgetState, saveBudgetLimit } from "../models/budgetsData";
import { supabase } from "../models/supabase";

function rows(state, config) {
  return [
    { categoryId: "TOTAL", limit: state.totalLimit, spent: state.totalSpent, status: statusOf(state.totalSpent, state.totalLimit, config) },
    ...Object.entries(state.categoryLimits).map(([categoryId, value]) => ({
      categoryId: Number(categoryId), limit: value.tot, spent: value.cur, status: statusOf(value.cur, value.tot, config),
    })),
  ];
}

function statusOf(spent, limit, config) {
  const percent = Number(limit) > 0 ? Number(spent) / Number(limit) * 100 : 0;
  return percent >= config.danger ? "danger" : percent >= config.warning ? "warning" : "normal";
}

export async function fetchBudgets() {
  const [state, config] = await Promise.all([fetchBudgetState(), fetchBudgetConfig()]);
  return rows(state, config);
}

async function currentUserId() {
  const { data, error } = await supabase.auth.getUser();
  if (error) throw error;
  return data.user.id;
}

export async function saveCategoryLimit(categoryId, limit) {
  const [state, config] = await Promise.all([saveBudgetLimit(await currentUserId(), "category", categoryId, limit), fetchBudgetConfig()]);
  return rows(state, config);
}

export async function saveTotalLimit(limit) {
  const [state, config] = await Promise.all([saveBudgetLimit(await currentUserId(), "total", null, limit), fetchBudgetConfig()]);
  return rows(state, config);
}

export async function removeBudget(categoryId) {
  return saveCategoryLimit(categoryId, 0);
}
