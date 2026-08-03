import { useEffect, useState } from "react";
import { fetchCategories } from "../../../models/danhMucData";

// Danh mục mặc định của hệ thống (danh_muc.la_mac_dinh = true), read-only.
// DB chỉ cho user thêm/sửa danh mục của chính họ; muốn admin sửa danh mục
// mặc định thì phải bổ sung policy riêng cho vai trò ADMIN.
export default function AdminCategories({ t }) {
  const [cats, setCats] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    fetchCategories().then(
      (data) => {
        if (!alive) return;
        setCats(data.filter((c) => c.isDefault));
        setLoading(false);
      },
      () => alive && setLoading(false),
    );
    return () => {
      alive = false;
    };
  }, []);

  return (
    <div className="card glass">
      <div className="card-h">
        <div>
          <h3>{t.categories.heading}</h3>
        </div>
      </div>
      {loading ? (
        <p className="muted" style={{ padding: "16px 4px" }}>
          {t.loadingSession}
        </p>
      ) : (
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "8px",
            padding: "8px 4px",
          }}
        >
          {cats.map((c) => (
            <span key={c.id} className="badge">
              {c.icon} {c.name}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
