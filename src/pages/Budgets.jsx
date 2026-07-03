export default function Budgets({ searchTerm = "" }) {
  const budgetItems = [
    {
      name: "Cà phê/trà sữa",
      icon: "☕",
      className: "c-coffee",
      spent: "305.000",
      limit: "350.000",
      percent: 86,
      badgeClass: "badge b-warn",
      barClass: "bar warn",
      barWidth: "86%",
    },
    {
      name: "Ăn uống",
      icon: "🍜",
      className: "c-food",
      spent: "741.000",
      limit: "1.000.000",
      percent: 74,
      badgeClass: "badge",
      badgeStyle: {
        background: "var(--surface-2)",
        color: "var(--text-dim)",
      },
      barClass: "bar",
      barWidth: "74%",
    },
    {
      name: "Giải trí",
      icon: "🎮",
      className: "c-fun",
      spent: "392.000",
      limit: "400.000",
      percent: 98,
      badgeClass: "badge b-out",
      barClass: "bar danger",
      barWidth: "98%",
    },
    {
      name: "Đi lại",
      icon: "🛵",
      className: "c-move",
      spent: "480.000",
      limit: "600.000",
      percent: 80,
      badgeClass: "badge",
      badgeStyle: {
        background: "var(--surface-2)",
        color: "var(--text-dim)",
      },
      barClass: "bar warn",
      barWidth: "80%",
    },
    {
      name: "Mua sắm",
      icon: "🛍️",
      className: "c-shop",
      spent: "120.000",
      limit: "500.000",
      percent: 24,
      badgeClass: "badge b-in",
      barClass: "bar ok",
      barWidth: "24%",
    },
  ];

  const query = searchTerm.trim().toLowerCase();
  const visibleBudgets = budgetItems.filter((item) => {
    if (!query) return true;
    return [item.name, item.spent, item.limit, String(item.percent)].some(
      (value) => value.toLowerCase().includes(query),
    );
  });

  return (
    <>
      <div className="grid g-12">
        <div>
          <div className="card glass" style={{ marginBottom: "18px" }}>
            <div className="card-h">
              <h3>Hạn mức tổng tháng 6</h3>
            </div>
            <div style={{ textAlign: "center", margin: "6px 0 16px" }}>
              <div
                style={{
                  fontSize: "2rem",
                  fontWeight: "700",
                  letterSpacing: "-.5px",
                }}
              >
                2.180.000 ₫
              </div>
              <small style={{ color: "var(--text-dim)" }}>
                đã tiêu trên 3.000.000 ₫
              </small>
            </div>
            <div className="track" style={{ height: "13px" }}>
              <div className="bar warn" style={{ width: "73%" }}></div>
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginTop: "9px",
                fontSize: ".8rem",
              }}
            >
              <span style={{ color: "var(--warn)" }}>73% đã dùng</span>
              <span style={{ color: "var(--text-dim)" }}>
                Còn lại 820.000 ₫
              </span>
            </div>
          </div>
          <div className="card glass">
            <div className="card-h">
              <h3>Đặt hạn mức</h3>
            </div>
            <div className="field">
              <label>Loại hạn mức</label>
              <select>
                <option>Hạn mức tổng tháng</option>
                <option>Theo danh mục</option>
              </select>
            </div>
            <div className="field">
              <label>Danh mục</label>
              <select>
                <option>☕ Cà phê/trà sữa</option>
                <option>🍜 Ăn uống</option>
              </select>
            </div>
            <div className="field">
              <label>Số tiền hạn mức</label>
              <input defaultValue="300.000" placeholder="0 ₫" />
            </div>
            <button className="btn btn-primary" style={{ width: "100%" }}>
              Lưu hạn mức
            </button>
          </div>
        </div>

        <div className="card glass">
          <div className="card-h">
            <h3>Hạn mức theo danh mục</h3>
            <span className="muted">Cảnh báo ở 80% và 100%</span>
          </div>
          {visibleBudgets.length > 0 ? (
            visibleBudgets.map((item) => (
              <div className="budrow" key={item.name}>
                <div className="top">
                  <div
                    className={`cat ${item.className}`}
                    style={{
                      width: "32px",
                      height: "32px",
                      borderRadius: "9px",
                      display: "grid",
                      placeItems: "center",
                    }}
                  >
                    {item.icon}
                  </div>
                  <b>{item.name}</b>
                  <span className="nums">
                    <b>{item.spent}</b> / {item.limit} ₫
                  </span>
                  <span className={item.badgeClass} style={item.badgeStyle}>
                    {item.percent}%
                  </span>
                </div>
                <div className="track">
                  <div
                    className={item.barClass}
                    style={{ width: item.barWidth }}
                  ></div>
                </div>
              </div>
            ))
          ) : (
            <div
              style={{
                padding: "18px 0",
                color: "var(--text-dim)",
                textAlign: "center",
              }}
            >
              Không tìm thấy hạn mức phù hợp.
            </div>
          )}
        </div>
      </div>
    </>
  );
}
