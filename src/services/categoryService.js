import * as mockDb from "./mockDb";

export const fetchCategories = () => mockDb.getCategories();
export const createCategory = (data) => mockDb.addCategory(data);
export const editCategory = (id, patch) => mockDb.updateCategory(id, patch);
export const removeCategory = (id) => mockDb.deleteCategory(id);