export default function Dashboard() {
  return (
    <>
      <div className="alert">
        <svg>
          <use href="#i-warn" />
        </svg>
        <div>
          Danh mục <b>Cà phê/trà sữa</b> đã dùng <b>86%</b> hạn mức tháng — còn
          lại 42.000 ₫
        </div>
      </div>

      <div className="grid g-4">
        <div className="stat glass">
          <div className="row">
            <label>Số dư hiện tại</label>
            <div className="ico ico-pri">
              <svg>
                <use href="#i-wallet" />
              </svg>
            </div>
          </div>
          <div className="val">4.250.000 ₫</div>
          <span className="chg up">↑ 8,2% so với tháng trước</span>
        </div>
        <div className="stat glass">
          <div className="row">
            <label>Chi hôm nay</label>
            <div className="ico ico-warn">
              <svg>
                <use href="#i-swap" />
              </svg>
            </div>
          </div>
          <div className="val">145.000 ₫</div>
          <span className="chg down">3 giao dịch</span>
        </div>
        <div className="stat glass">
          <div className="row">
            <label>Chi tuần này</label>
            <div className="ico ico-cyan">
              <svg>
                <use href="#i-chart" />
              </svg>
            </div>
          </div>
          <div className="val">820.000 ₫</div>
          <span className="chg up">↓ 12% so với tuần trước</span>
        </div>
        <div className="stat glass">
          <div className="row">
            <label>Chuỗi ghi chép</label>
            <div className="ico ico-ok">
              <svg>
                <use href="#i-flag" />
              </svg>
            </div>
          </div>
          <div className="val">
            12{" "}
            <span style={{ fontSize: "1rem", color: "var(--text-dim)" }}>
              ngày
            </span>
          </div>
          <span className="chg up">🔥 Kỷ lục: 18 ngày</span>
        </div>
      </div>

      <div className="grid g-21" style={{ marginTop: "18px" }}>
        <div className="card glass">
          <div className="card-h">
            <h3>Chi tiêu theo danh mục</h3>
            <span className="muted">Tháng 6/2026</span>
          </div>
          <div className="donut-wrap">
            <div className="donut">
              <svg width="150" height="150" viewBox="0 0 42 42">
                <circle
                  cx="21"
                  cy="21"
                  r="15.9"
                  fill="none"
                  stroke="var(--track)"
                  strokeWidth="5"
                />
                <circle
                  cx="21"
                  cy="21"
                  r="15.9"
                  fill="none"
                  stroke="#f87171"
                  strokeWidth="5"
                  strokeDasharray="34 66"
                  strokeDashoffset="0"
                  transform="rotate(-90 21 21)"
                />
                <circle
                  cx="21"
                  cy="21"
                  r="15.9"
                  fill="none"
                  stroke="#60a5fa"
                  strokeWidth="5"
                  strokeDasharray="22 78"
                  strokeDashoffset="-34"
                  transform="rotate(-90 21 21)"
                />
                <circle
                  cx="21"
                  cy="21"
                  r="15.9"
                  fill="none"
                  stroke="#fbbf24"
                  strokeWidth="5"
                  strokeDasharray="18 82"
                  strokeDashoffset="-56"
                  transform="rotate(-90 21 21)"
                />
                <circle
                  cx="21"
                  cy="21"
                  r="15.9"
                  fill="none"
                  stroke="#a78bfa"
                  strokeWidth="5"
                  strokeDasharray="14 86"
                  strokeDashoffset="-74"
                  transform="rotate(-90 21 21)"
                />
                <circle
                  cx="21"
                  cy="21"
                  r="15.9"
                  fill="none"
                  stroke="#34d399"
                  strokeWidth="5"
                  strokeDasharray="12 88"
                  strokeDashoffset="-88"
                  transform="rotate(-90 21 21)"
                />
              </svg>
              <div className="center">
                <b>2.18tr</b>
                <small>tổng chi</small>
              </div>
            </div>
            <div className="legend">
              <div className="li">
                <span className="sw" style={{ background: "#f87171" }}></span>Ăn
                uống<b>741.000 ₫</b>
              </div>
              <div className="li">
                <span className="sw" style={{ background: "#60a5fa" }}></span>Đi
                lại<b>480.000 ₫</b>
              </div>
              <div className="li">
                <span className="sw" style={{ background: "#fbbf24" }}></span>
                Giải trí<b>392.000 ₫</b>
              </div>
              <div className="li">
                <span className="sw" style={{ background: "#a78bfa" }}></span>Cà
                phê/trà sữa<b>305.000 ₫</b>
              </div>
              <div className="li">
                <span className="sw" style={{ background: "#34d399" }}></span>
                Khác<b>262.000 ₫</b>
              </div>
            </div>
          </div>
        </div>

        <div className="card glass">
          <div className="card-h">
            <h3>Mục tiêu tiết kiệm</h3>
            <span className="muted">3 đang chạy</span>
          </div>
          <div
            style={{ display: "flex", flexDirection: "column", gap: "16px" }}
          >
            <div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontSize: ".84rem",
                  marginBottom: "7px",
                }}
              >
                <span>📱 Mua điện thoại</span>
                <b>61%</b>
              </div>
              <div className="track">
                <div className="bar" style={{ width: "61%" }}></div>
              </div>
              <small style={{ color: "var(--text-dim)", fontSize: ".74rem" }}>
                9.200.000 / 15.000.000 ₫
              </small>
            </div>
            <div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontSize: ".84rem",
                  marginBottom: "7px",
                }}
              >
                <span>✈️ Du lịch Đà Lạt</span>
                <b>62%</b>
              </div>
              <div className="track">
                <div className="bar ok" style={{ width: "62%" }}></div>
              </div>
              <small style={{ color: "var(--text-dim)", fontSize: ".74rem" }}>
                3.100.000 / 5.000.000 ₫
              </small>
            </div>
            <div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontSize: ".84rem",
                  marginBottom: "7px",
                }}
              >
                <span>💻 Mua laptop</span>
                <b>16%</b>
              </div>
              <div className="track">
                <div className="bar" style={{ width: "16%" }}></div>
              </div>
              <small style={{ color: "var(--text-dim)", fontSize: ".74rem" }}>
                4.000.000 / 25.000.000 ₫
              </small>
            </div>
          </div>
        </div>
      </div>

      <div className="card glass" style={{ marginTop: "18px" }}>
        <div className="card-h">
          <h3>Giao dịch gần đây</h3>
          <span className="muted" style={{ cursor: "pointer" }}>
            Xem tất cả →
          </span>
        </div>
        <div className="tx">
          <div className="cat c-coffee">☕</div>
          <div className="meta">
            <b>Trà sữa Phúc Long</b>
            <small>Hôm nay · 14:20 · Ví điện tử</small>
          </div>
          <div className="amt out">-35.000 ₫</div>
        </div>
        <div className="tx">
          <div className="cat c-food">🍜</div>
          <div className="meta">
            <b>Cơm trưa</b>
            <small>Hôm nay · 12:05 · Tiền mặt</small>
          </div>
          <div className="amt out">-45.000 ₫</div>
        </div>
        <div className="tx">
          <div className="cat c-move">🛵</div>
          <div className="meta">
            <b>Đổ xăng</b>
            <small>Hôm nay · 08:30 · Tiền mặt</small>
          </div>
          <div className="amt out">-65.000 ₫</div>
        </div>
        <div className="tx">
          <div className="cat c-salary">💰</div>
          <div className="meta">
            <b>Lương làm thêm</b>
            <small>Hôm qua · Chuyển khoản</small>
          </div>
          <div className="amt in">+1.500.000 ₫</div>
        </div>
      </div>
    </>
  );
}
