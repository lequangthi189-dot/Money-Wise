import * as mockDb from "./mockDb";

export const fetchBudgets = () => mockDb.getBudgets();
export const saveCategoryLimit = (categoryId, limit) =>
  mockDb.setCategoryBudget(categoryId, limit);
export const saveTotalLimit = (limit) =>
  mockDb.setCategoryBudget("TOTAL", limit);
export const removeBudget = (categoryId) => mockDb.deleteBudget(categoryId);