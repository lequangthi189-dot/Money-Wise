import * as mockDb from "./mockDb";

export const fetchTransactions = () => mockDb.getTransactions();
export const createTransaction = (tx) => mockDb.addTransaction(tx);