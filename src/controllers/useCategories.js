import { useCallback, useEffect, useState } from "react";
import {
  canDeleteCategory,
  createCategory,
  deleteCategory,
  fetchCategories,
  hideCategory,
  updateCategory,
} from "../models/danhMucData";

// Controller: quản lý danh mục thu/chi lấy từ Supabase — thêm, sửa, xoá.
// Danh mục mặc định (la_mac_dinh) dùng chung cho mọi người nên không sửa/xoá.
export function useCategories(userId, onDataChanged, text) {
  const [cats, setCats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const [showForm, setShowForm] = useState(false);
  const [newName, setNewName] = useState("");
  const [newType, setNewType] = useState("out");
  const [selectedIcon, setSelectedIcon] = useState("📌");
  const [editingId, setEditingId] = useState(null);

  // Không setState đồng bộ ở đây: hàm được gọi thẳng trong useEffect, mọi
  // cập nhật state phải nằm sau await để tránh cascading render.
  const reload = useCallback(async () => {
    try {
      const data = await fetchCategories();
      setCats(data);
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
    fetchCategories().then(
      (data) => {
        if (!alive) return;
        setCats(data);
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

  const expenseCats = cats.filter((c) => c.type === "out");
  const incomeCats = cats.filter((c) => c.type === "in");

  function resetForm() {
    setNewName("");
    setNewType("out");
    setSelectedIcon("📌");
    setEditingId(null);
    setShowForm(false);
  }

  async function handleAddCategory() {
    if (newName.trim() === "" || saving) return;
    setSaving(true);
    setError("");
    try {
      if (editingId !== null) {
        // Không gửi loai_danh_muc: trigger kiem_tra_danh_muc chặn đổi loại.
        const updated = await updateCategory(editingId, {
          name: newName,
          icon: selectedIcon,
        });
        setCats((list) =>
          list.map((c) => (c.id === editingId ? updated : c)),
        );
      } else {
        const created = await createCategory({
          userId,
          name: newName,
          type: newType,
          icon: selectedIcon,
        });
        setCats((list) => [...list, created]);
      }
      resetForm();
      await onDataChanged?.();
    } catch (e) {
      if (e.code === "CATEGORY_ALREADY_EXISTS" || e.code === "23505") {
        setError(text.alreadyExists(newName.trim()));
      } else {
        setError(e.message);
      }
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteCategory(id) {
    const cat = cats.find((c) => c.id === id);
    if (!cat || cat.isSystem || saving) return;

    setSaving(true);
    setError("");
    try {
      const canDelete = await canDeleteCategory(id);
      if (canDelete) {
        if (!window.confirm(text.confirmDelete(cat.name))) return;
        await deleteCategory(id);
      } else {
        if (!window.confirm(text.confirmHide(cat.name))) return;
        await hideCategory(id);
        setError(text.hiddenWithTransactions);
      }
      setCats((list) => list.filter((c) => c.id !== id));
      await onDataChanged?.();
    } catch (e) {
      setError(e.message || "Không thể xoá danh mục.");
    } finally {
      setSaving(false);
    }
  }

  function handleEditCategory(cat) {
    setEditingId(cat.id);
    setNewName(cat.name);
    setNewType(cat.type);
    setSelectedIcon(cat.icon);
    setShowForm(true);
  }

  return {
    expenseCats,
    incomeCats,
    loading,
    error,
    saving,
    isEditing: editingId !== null,
    showForm,
    setShowForm,
    newName,
    setNewName,
    newType,
    setNewType,
    selectedIcon,
    setSelectedIcon,
    handleAddCategory,
    handleDeleteCategory,
    handleEditCategory,
    handleCloseForm: resetForm,
    reload,
  };
}
