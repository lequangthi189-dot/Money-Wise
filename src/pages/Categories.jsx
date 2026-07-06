import "./Categories.css";
import { useState } from "react";

const CATEGORY_ICONS = [
  "🍜",
  "🛵",
  "📚",
  "🏠",
  "🎮",
  "🛍️",
  "☕",
  "❤️",
  "💰",
  "🎓",
  "🐶",
  "🎵",
  "✈️",
  "💻",
  "🎁",
  "📌",
  "👨‍👩‍👧"
];

const EXPENSE = [
  { id: 1, icon: "🍜", cls: "c-food", key: "food" },
  { id: 2, icon: "🛵", cls: "c-move", key: "move" },
  { id: 3, icon: "📚", cls: "c-edu", key: "edu" },
  { id: 4, icon: "🏠", cls: "c-rent", key: "rent" },
  { id: 5, icon: "🎮", cls: "c-fun", key: "fun" },
  { id: 6, icon: "🛍️", cls: "c-shop", key: "shop" },
  { id: 7, icon: "☕", cls: "c-coffee", key: "coffee" },
  { id: 8, icon: "❤️", cls: "c-health", key: "health" },
];
const INCOME = [
  { id: 9, icon: "💰", cls: "c-salary", key: "salary" },
  { id: 10, icon: "👨‍👩‍👧", cls: "c-salary", key: "family" },
  { id: 11, icon: "🎓", cls: "c-salary", key: "scholar" },
];

function CatCard({ c, type, t, onDelete, onEdit }) {
  return (
    <div className="catcard">
      <div className={"cat " + c.cls}>{c.icon}</div>
      <div className="meta">
        <b>{c.name || t.cats[c.key]}</b>
      </div>
      <span className={"badge " + (type === "in" ? "b-in" : "b-out")}>
        {type === "in" ? t.thu : t.chi}
      </span>
      <div className="act">
        <button aria-label="edit" onClick={() => onEdit(c, type)}>
          <svg width="15" height="15">
            <use href="#i-edit" />
          </svg>
        </button>
        <button aria-label="delete" onClick={() => onDelete(c.id, type)}>
          <svg width="15" height="15">
            <use href="#i-trash" />
          </svg>
        </button>
      </div>
    </div>
  );
}

export default function Categories({ t }) {
  const c = t.categories;
  const [expenseCats, setExpenseCats] = useState(EXPENSE);
  const [incomeCats, setIncomeCats] = useState(INCOME);
  const [showForm, setShowForm] = useState(false);
  const [newName, setNewName] = useState("");
  const [newType, setNewType] = useState("out");
  const [selectedIcon, setSelectedIcon] = useState("📌");
  const [editingId, setEditingId] = useState(null);
  const [editingType, setEditingType] = useState(null);
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
      setExpenseCats(expenseCats.map((x) => x.id === editingId ? updatedCat : x));
    } else {
      setIncomeCats(incomeCats.map((x) => x.id === editingId ? updatedCat : x));
    }

    setEditingId(null);
    setEditingType(null);
    setNewName("");
    setNewType("out");
    setSelectedIcon("📌");
    setShowForm(false);
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

  setNewName("");
  setNewType("out");
  setSelectedIcon("📌");
  setShowForm(false);
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

  function handleCloseForm() {
  setShowForm(false);
  setNewName("");
  setNewType("out");
  setSelectedIcon("📌");

  setEditingId(null);
  setEditingType(null);
}

  return (
    <div className="card glass">
      <div className="card-h">
        <div>
          <h3>{c.heading}</h3>
          <span className="muted">{c.sub}</span>
        </div>
        <button className="btn btn-primary" onClick={() => setShowForm(true)}>
          <svg
            width="16"
            height="16"
            style={{ marginRight: "6px", verticalAlign: "-2px" }}
          >
            <use href="#i-plus" />
          </svg>
          {c.add}
        </button>
      </div>
      {showForm && (
        <div className="card glass" style={{ margin: "12px 0" }}>
          <button className="btn btn-primary" onClick={handleAddCategory}>
            Lưu
          </button>
          <button className="btn" onClick={handleCloseForm}>
            Đóng
          </button>
          <div>
            {CATEGORY_ICONS.map((icon) => (
              <button
                key={icon}
                type="button"
                className={"icon-choice" + (selectedIcon === icon ? " active" : "")}
                onClick={() => setSelectedIcon(icon)}
              >
                {icon}
              </button>
            ))}
          </div>
          <input
            type="text"
            placeholder="Tên danh mục"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
          />
          <select value={newType} onChange={(e) => setNewType(e.target.value)}>
            <option value="out">Chi tiêu</option>
            <option value="in">Thu nhập</option>
          </select>
          </div>
      )}

      <div className="category-group-title">
        {c.expenseGroup}
      </div>
      <div className="catgrid">
        {expenseCats.map((x) => (
          <CatCard
            key={x.id}
            c={x}
            type="out"
            t={t}
            onDelete={handleDeleteCategory}
            onEdit={handleEditCategory}
          />
        ))}
      </div>

      <div className="category-group-title income-title">
        {c.incomeGroup}
      </div>
      <div className="catgrid">
        {incomeCats.map((x) => (
          <CatCard
            key={x.id}
            c={x}
            type="in"
            t={t}
            onDelete={handleDeleteCategory}
            onEdit={handleEditCategory}
          />
        ))}
      </div>
     
    </div>
  );
}

