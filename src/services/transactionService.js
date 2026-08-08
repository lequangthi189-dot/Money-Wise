import {
  createTransaction as insertTransaction,
  fetchPaymentMethods,
  fetchTransactions as fetchRows,
} from "../models/giaoDichData";

function daysFromToday(dateISO) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const date = new Date(`${dateISO}T00:00:00`);
  return Math.max(0, Math.floor((today - date) / 86400000));
}

function normalize(row) {
  return {
    ...row,
    amount: Number(row.amountRaw),
    note: row.name,
    method: row.mkey,
    daysAgo: daysFromToday(row.dateISO),
  };
}

export async function fetchTransactions() {
  const methods = await fetchPaymentMethods();
  return (await fetchRows(methods)).map(normalize);
}

export async function createTransaction(tx) {
  await insertTransaction(tx);
  return tx;
}
