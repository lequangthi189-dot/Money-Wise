import { useRef } from "react";
import "../css/pages/categories-form.css";
import { CATEGORY_ICONS } from "../../models/categoriesData";
import { useCategories } from "../../controllers/useCategories";

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

function CategoryTypeSelect({ value, onChange }) {
  const menuRef = useRef(null);
  const options = [
    { value: "out", label: "Chi tiêu" },
    { value: "in", label: "Thu nhập" },
  ];
  const selected = options.find((option) => option.value === value) ?? options[0];

  const selectType = (nextValue) => {
    onChange(nextValue);
    menuRef.current?.removeAttribute("open");
  };

  return (
    <details className="category-type-select" ref={menuRef}>
      <summary aria-label="Loại danh mục">{selected.label}</summary>
      <div className="category-type-menu" role="listbox" aria-label="Loại danh mục">
        {options.map((option) => (
          <button
            key={option.value}
            type="button"
            role="option"
            aria-selected={value === option.value}
            className={value === option.value ? "selected" : ""}
            onClick={() => selectType(option.value)}
          >
            {option.label}
          </button>
        ))}
      </div>
    </details>
  );
}

export default function Categories({ t }) {
  const c = t.categories;
  const {
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
  } = useCategories();

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
          <CategoryTypeSelect value={newType} onChange={setNewType} />
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

