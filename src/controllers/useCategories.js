import { useState } from "react";
import { EXPENSE, INCOME } from "../models/categoriesData";

// Controller: quản lý danh mục thu/chi — thêm, sửa, xoá; điều khiển form nhập.
// Danh mục mặc định (có `key`) không được sửa/xoá.
export function useCategories() {
  const [expenseCats, setExpenseCats] = useState(EXPENSE);
  const [incomeCats, setIncomeCats] = useState(INCOME);
  const [showForm, setShowForm] = useState(false);
  const [newName, setNewName] = useState("");
  const [newType, setNewType] = useState("out");
  const [selectedIcon, setSelectedIcon] = useState("📌");
  const [editingId, setEditingId] = useState(null);
  const [editingType, setEditingType] = useState(null);

  function resetForm() {
    setNewName("");
    setNewType("out");
    setSelectedIcon("📌");
    setEditingId(null);
    setEditingType(null);
    setShowForm(false);
  }

  function handleAddCategory() {
    if (newName.trim() === "") return;

    if (editingId !== null) {
      const updatedCat = {
        id: editingId,
        icon: selectedIcon,
        cls: "c-shop",
        name: newName,
      };

      if (editingType === "out") {
        setExpenseCats(
          expenseCats.map((x) => (x.id === editingId ? updatedCat : x)),
        );
      } else {
        setIncomeCats(
          incomeCats.map((x) => (x.id === editingId ? updatedCat : x)),
        );
      }

      resetForm();
      return;
    }

    const newCat = {
      id: Date.now(),
      icon: selectedIcon,
      cls: "c-shop",
      name: newName,
    };

    if (newType === "out") {
      setExpenseCats([...expenseCats, newCat]);
    } else {
      setIncomeCats([...incomeCats, newCat]);
    }

    resetForm();
  }

  function handleDeleteCategory(id, type) {
    const list = type === "out" ? expenseCats : incomeCats;
    const cat = list.find((x) => x.id === id);

    if (cat.key) {
      alert("Không thể xóa danh mục mặc định");
      return;
    }

    if (type === "out") {
      setExpenseCats(expenseCats.filter((x) => x.id !== id));
    } else {
      setIncomeCats(incomeCats.filter((x) => x.id !== id));
    }
  }

  function handleEditCategory(cat, type) {
    if (cat.key) {
      alert("Không thể sửa danh mục mặc định");
      return;
    }

    setEditingId(cat.id);
    setEditingType(type);
    setNewName(cat.name);
    setNewType(type);
    setSelectedIcon(cat.icon);
    setShowForm(true);
  }

  return {
    expenseCats,
    incomeCats,
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
  };
}
