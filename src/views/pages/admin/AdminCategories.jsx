import { EXPENSE, INCOME } from "../../../models/categoriesData";

// TODO: cho phép admin thêm/sửa/xóa danh mục mặc định (EXPENSE/INCOME)
// áp dụng cho toàn hệ thống. Hiện tại chỉ hiển thị read-only.
export default function AdminCategories({ t }) {
  return (
    <div className="card glass">
      <div className="card-h">
        <div>
          <h3>{t.categories.heading}</h3>
        </div>
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", padding: "8px 4px" }}>
        {[...EXPENSE, ...INCOME].map((c) => (
          <span key={c.id} className="badge">
            {c.icon} {t.cats[c.key]}
          </span>
        ))}
      </div>
    </div>
  );
}
