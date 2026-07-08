import { TXNS } from "../models/transactionsData";

// Controller: lọc danh sách giao dịch theo từ khoá tìm kiếm (tên, phương thức,
// số tiền hoặc ngày). Trả về danh sách đã lọc để view hiển thị.
export function useTransactions(query, t) {
  const q = query.trim().toLowerCase();
  const filtered = q
    ? TXNS.filter(
        (tx) =>
          tx.name.toLowerCase().includes(q) ||
          t.methods[tx.mkey].toLowerCase().includes(q) ||
          tx.amount.toLowerCase().includes(q) ||
          tx.date.includes(q),
      )
    : TXNS;

  return { filtered };
}
