import { useState } from "react";
import { useAppData } from "../context/AppDataContext";

export function useCategories() {
  const { categories, addCategory, updateCategory, deleteCategory } =
    useAppData();

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [newName, setNewName] = useState("");
  const [newType, setNewType] = useState("out");
  const [selectedIcon, setSelectedIcon] = useState("🍜");

  const expenseCats = categories.filter((c) => c.type === "out");
  const incomeCats = categories.filter((c) => c.type === "in");

  const resetForm = () => {
    setEditingId(null);
    setNewName("");
    setNewType("out");
    setSelectedIcon("🍜");
  };

  const handleAddCategory = () => {
    if (!newName.trim()) return;
    if (editingId) {
      updateCategory(editingId, {
        name: newName,
        type: newType,
        icon: selectedIcon,
      });
    } else {
      addCategory({ name: newName, type: newType, icon: selectedIcon });
    }
    resetForm();
    setShowForm(false);
  };

  const handleDeleteCategory = (id) => {
    deleteCategory(id);
  };

  const handleEditCategory = (c) => {
    setEditingId(c.id);
    setNewName(c.name || "");
    setNewType(c.type);
    setSelectedIcon(c.icon);
    setShowForm(true);
  };

  const handleCloseForm = () => {
    resetForm();
    setShowForm(false);
  };

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
    handleCloseForm,
    isEditing: editingId !== null,
  };
}