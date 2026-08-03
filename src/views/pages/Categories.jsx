import { useRef } from "react";
import "../css/pages/categories-form.css";
import { CATEGORY_ICONS } from "../../models/danhMucData";
import { useCategories } from "../../controllers/useCategories";

function CatCard({ c, type, t, onDelete, onEdit }) {
  return (
    <div className="catcard">
      <div className={"cat " + c.cls}>{c.icon}</div>
      <div className="meta">
        <b>{c.name}</b>
      </div>
      <span className={"badge " + (type === "in" ? "b-in" : "b-out")}>
        {type === "in" ? t.thu : t.chi}
      </span>
      <div className="act">
        <button aria-label="edit" onClick={() => onEdit(c)}>
          <svg width="15" height="15">
            <use href="#i-edit" />
          </svg>
        </button>
        <button aria-label="delete" onClick={() => onDelete(c.id)}>
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

export default function Categories({ t, userId }) {
  const c = t.categories;
  const {
    expenseCats,
    incomeCats,
    loading,
    error,
    saving,
    isEditing,
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
  } = useCategories(userId);

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
      {error && (
        <div
          style={{
            fontSize: ".8rem",
            color: "var(--danger)",
            background: "rgba(248,113,113,.12)",
            border: "1px solid rgba(248,113,113,.3)",
            borderRadius: "10px",
            padding: "10px 12px",
            margin: "10px 0",
          }}
        >
          {error}
        </div>
      )}

      {showForm && (
        <div className="card glass category-form-card" style={{ margin: "12px 0" }}>
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
          {/* DB không cho đổi loại sau khi tạo, nên khi sửa chỉ hiển thị. */}
          {isEditing ? (
            <div className="category-type-pill">
              <span className="category-type-pill-label">Loại</span>
              <span className={newType === "in" ? "category-type-pill-value income" : "category-type-pill-value expense"}>
                {newType === "in" ? t.thu : t.chi}
              </span>
            </div>
          ) : (
            <CategoryTypeSelect value={newType} onChange={setNewType} />
          )}
          <div className="category-form-actions">
            <button
              className="btn btn-primary"
              onClick={handleAddCategory}
              disabled={saving}
            >
              {saving ? "Đang lưu…" : "Lưu"}
            </button>
            <button className="btn" onClick={handleCloseForm}>
              Đóng
            </button>
          </div>
        </div>
      )}

      {loading && (
        <div
          style={{
            padding: "26px 10px",
            textAlign: "center",
            color: "var(--text-dim)",
            fontSize: ".85rem",
          }}
        >
          {t.loadingSession}
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

