export default function Budgets() {
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
          <div className="budrow">
            <div className="top">
              <div
                className="cat c-coffee"
                style={{
                  width: "32px",
                  height: "32px",
                  borderRadius: "9px",
                  display: "grid",
                  placeItems: "center",
                }}
              >
                ☕
              </div>
              <b>Cà phê/trà sữa</b>
              <span className="nums">
                <b>305.000</b> / 350.000 ₫
              </span>
              <span className="badge b-warn">86%</span>
            </div>
            <div className="track">
              <div className="bar warn" style={{ width: "86%" }}></div>
            </div>
          </div>
          <div className="budrow">
            <div className="top">
              <div
                className="cat c-food"
                style={{
                  width: "32px",
                  height: "32px",
                  borderRadius: "9px",
                  display: "grid",
                  placeItems: "center",
                }}
              >
                🍜
              </div>
              <b>Ăn uống</b>
              <span className="nums">
                <b>741.000</b> / 1.000.000 ₫
              </span>
              <span
                className="badge"
                style={{
                  background: "var(--surface-2)",
                  color: "var(--text-dim)",
                }}
              >
                74%
              </span>
            </div>
            <div className="track">
              <div className="bar" style={{ width: "74%" }}></div>
            </div>
          </div>
          <div className="budrow">
            <div className="top">
              <div
                className="cat c-fun"
                style={{
                  width: "32px",
                  height: "32px",
                  borderRadius: "9px",
                  display: "grid",
                  placeItems: "center",
                }}
              >
                🎮
              </div>
              <b>Giải trí</b>
              <span className="nums">
                <b>392.000</b> / 400.000 ₫
              </span>
              <span className="badge b-out">98%</span>
            </div>
            <div className="track">
              <div className="bar danger" style={{ width: "98%" }}></div>
            </div>
          </div>
          <div className="budrow">
            <div className="top">
              <div
                className="cat c-move"
                style={{
                  width: "32px",
                  height: "32px",
                  borderRadius: "9px",
                  display: "grid",
                  placeItems: "center",
                }}
              >
                🛵
              </div>
              <b>Đi lại</b>
              <span className="nums">
                <b>480.000</b> / 600.000 ₫
              </span>
              <span
                className="badge"
                style={{
                  background: "var(--surface-2)",
                  color: "var(--text-dim)",
                }}
              >
                80%
              </span>
            </div>
            <div className="track">
              <div className="bar warn" style={{ width: "80%" }}></div>
            </div>
          </div>
          <div className="budrow">
            <div className="top">
              <div
                className="cat c-shop"
                style={{
                  width: "32px",
                  height: "32px",
                  borderRadius: "9px",
                  display: "grid",
                  placeItems: "center",
                }}
              >
                🛍️
              </div>
              <b>Mua sắm</b>
              <span className="nums">
                <b>120.000</b> / 500.000 ₫
              </span>
              <span className="badge b-in">24%</span>
            </div>
            <div className="track">
              <div className="bar ok" style={{ width: "24%" }}></div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
