import { useCallback, useEffect, useState } from "react";
import {
  createTransaction,
  deleteTransaction,
  fetchPaymentMethods,
  fetchTransactions,
  updateTransaction,
} from "../models/giaoDichData";
import { fetchCategories } from "../models/danhMucData";
import { parseMoney, todayISO } from "../models/format";

const FORM_RONG = {
  type: "out",
  amount: "",
  categoryId: "",
  date: todayISO(),
  methodId: "",
  note: "",
};

// Controller: danh sách giao dịch từ Supabase + form thêm/sửa/xoá.
// Lọc theo từ khoá tìm kiếm (nội dung, danh mục, phương thức, số tiền, ngày).
export function useTransactions(query, t, userId, onDataChanged) {
  const [txns, setTxns] = useState([]);
  const [cats, setCats] = useState([]);
  const [methods, setMethods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState(FORM_RONG);
  const [editingId, setEditingId] = useState(null);

  // Không setState đồng bộ ở đây: hàm được gọi thẳng trong useEffect, mọi
  // cập nhật state phải nằm sau await để tránh cascading render.
  const reload = useCallback(async () => {
    try {
      const [ms, cs] = await Promise.all([
        fetchPaymentMethods(),
        fetchCategories(),
      ]);
      const list = await fetchTransactions(ms);
      setMethods(ms);
      setCats(cs);
      setTxns(list);
      setError("");
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // Tải lần đầu. State được đặt trong callback của promise (không đồng bộ
  // trong thân effect) và bỏ qua nếu component đã unmount.
  useEffect(() => {
    let alive = true;
    Promise.all([fetchPaymentMethods(), fetchCategories()])
      .then(async ([ms, cs]) => [ms, cs, await fetchTransactions(ms)])
      .then(
        ([ms, cs, list]) => {
          if (!alive) return;
          setMethods(ms);
          setCats(cs);
          setTxns(list);
          setLoading(false);
        },
        (e) => {
          if (!alive) return;
          setError(e.message);
          setLoading(false);
        },
      );
    return () => {
      alive = false;
    };
  }, []);

  const upd = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  // Đổi loại thu/chi thì danh mục cũ không còn hợp lệ (FK tổng hợp trong DB
  // bắt loai_giao_dich khớp loai_danh_muc), nên bỏ chọn luôn.
  function setType(type) {
    setForm((f) => ({ ...f, type, categoryId: "" }));
  }

  const catsForType = cats.filter((c) => c.type === form.type);

  function resetForm() {
    setForm(FORM_RONG);
    setEditingId(null);
  }

  async function submit() {
    if (saving) return;
    setError("");

    const amount = parseMoney(form.amount);
    if (!Number.isFinite(amount) || amount <= 0)
      return setError("Số tiền phải lớn hơn 0.");
    if (!form.categoryId) return setError("Vui lòng chọn danh mục.");
    if (!form.methodId) return setError("Vui lòng chọn phương thức.");
    if (!form.date) return setError("Vui lòng chọn ngày.");
    if (form.date > todayISO())
      return setError("Ngày giao dịch không được lớn hơn hôm nay.");

    const payload = {
      userId,
      categoryId: Number(form.categoryId),
      methodId: Number(form.methodId),
      type: form.type,
      amount,
      date: form.date,
      note: form.note,
    };

    setSaving(true);
    try {
      if (editingId !== null) await updateTransaction(editingId, payload);
      else await createTransaction(payload);
      resetForm();
      // Tải lại vì trigger DB tính lại báo cáo/hạn mức sau mỗi thay đổi.
      await reload();
      // Chuỗi ghi chép cũng do trigger tính lại theo giao dịch.
      await onDataChanged?.();
    } catch (e) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  }

  function edit(tx) {
    setEditingId(tx.id);
    setError("");
    setForm({
      type: tx.type,
      amount: String(tx.amountRaw),
      categoryId: String(tx.categoryId),
      date: tx.dateISO,
      methodId: String(tx.methodId),
      note: tx.name,
    });
  }

  async function remove(id) {
    if (saving) return;
    setSaving(true);
    setError("");
    try {
      await deleteTransaction(id);
      if (editingId === id) resetForm();
      await reload();
      await onDataChanged?.();
    } catch (e) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  }

  const q = query.trim().toLowerCase();
  const filtered = q
    ? txns.filter(
        (tx) =>
          tx.name.toLowerCase().includes(q) ||
          tx.catName.toLowerCase().includes(q) ||
          (t.methods[tx.mkey] ?? "").toLowerCase().includes(q) ||
          tx.amount.toLowerCase().includes(q) ||
          tx.date.includes(q),
      )
    : txns;

  return {
    filtered,
    cats: catsForType,
    methods,
    loading,
    saving,
    error,
    form,
    upd,
    setType,
    isEditing: editingId !== null,
    submit,
    edit,
    remove,
    resetForm,
    reload,
  };
}
