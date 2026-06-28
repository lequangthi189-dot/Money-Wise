export default function Reports() {
  return (
    <>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "12px",
          marginBottom: "18px",
        }}
      >
        <select style={{ width: "auto" }}>
          <option>Tháng 6, 2026</option>
          <option>Tháng 5, 2026</option>
        </select>
        <div style={{ flex: "1" }}></div>
        <button className="btn">
          <svg
            width="16"
            height="16"
            style={{ verticalAlign: "-3px", marginRight: "5px" }}
          >
            <use href="#i-copy" />
          </svg>
          Tạo mã chia sẻ
        </button>
      </div>

      <div className="grid g-3">
        <div className="stat glass">
          <div className="row">
            <label>Tổng thu</label>
            <div className="ico ico-ok">
              <svg>
                <use href="#i-chart" />
              </svg>
            </div>
          </div>
          <div className="val sm" style={{ color: "var(--ok)" }}>
            5.500.000 ₫
          </div>
        </div>
        <div className="stat glass">
          <div className="row">
            <label>Tổng chi</label>
            <div className="ico ico-warn">
              <svg>
                <use href="#i-swap" />
              </svg>
            </div>
          </div>
          <div className="val sm" style={{ color: "var(--danger)" }}>
            2.180.000 ₫
          </div>
        </div>
        <div className="stat glass">
          <div className="row">
            <label>Số dư cuối tháng</label>
            <div className="ico ico-pri">
              <svg>
                <use href="#i-wallet" />
              </svg>
            </div>
          </div>
          <div className="val sm">3.320.000 ₫</div>
        </div>
      </div>

      <div className="grid g-2" style={{ marginTop: "18px" }}>
        <div className="card glass">
          <div className="card-h">
            <h3>Cơ cấu chi tiêu</h3>
            <span className="muted">Biểu đồ tròn</span>
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
                  strokeDasharray="26 74"
                  strokeDashoffset="-74"
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
                uống<b>34%</b>
              </div>
              <div className="li">
                <span className="sw" style={{ background: "#60a5fa" }}></span>Đi
                lại<b>22%</b>
              </div>
              <div className="li">
                <span className="sw" style={{ background: "#fbbf24" }}></span>
                Giải trí<b>18%</b>
              </div>
              <div className="li">
                <span className="sw" style={{ background: "#a78bfa" }}></span>
                Khác<b>26%</b>
              </div>
            </div>
          </div>
        </div>

        <div className="card glass">
          <div className="card-h">
            <h3>So sánh 6 tháng</h3>
            <span className="muted">Biểu đồ cột</span>
          </div>
          <div className="barchart">
            <div className="col">
              <div className="bw" style={{ height: "55%" }}></div>
              <small>T1</small>
            </div>
            <div className="col">
              <div className="bw" style={{ height: "70%" }}></div>
              <small>T2</small>
            </div>
            <div className="col">
              <div className="bw" style={{ height: "48%" }}></div>
              <small>T3</small>
            </div>
            <div className="col">
              <div className="bw" style={{ height: "82%" }}></div>
              <small>T4</small>
            </div>
            <div className="col">
              <div className="bw" style={{ height: "64%" }}></div>
              <small>T5</small>
            </div>
            <div className="col">
              <div
                className="bw"
                style={{
                  height: "73%",
                  background:
                    "linear-gradient(180deg,var(--accent-2),rgba(34,211,238,.3))",
                }}
              ></div>
              <small>T6</small>
            </div>
          </div>
        </div>
      </div>

      <div className="card glass" style={{ marginTop: "18px" }}>
        <div className="card-h">
          <h3>Xu hướng chi tiêu</h3>
          <span className="muted">Biểu đồ đường</span>
        </div>
        <svg
          width="100%"
          height="170"
          viewBox="0 0 600 170"
          preserveAspectRatio="none"
          style={{ overflow: "visible" }}
        >
          <polyline
            fill="none"
            stroke="var(--accent)"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            points="10,120 110,80 210,135 310,55 410,95 510,70 590,40"
          />
          <polyline
            fill="url(#fillgrad)"
            stroke="none"
            points="10,120 110,80 210,135 310,55 410,95 510,70 590,40 590,170 10,170"
          />
          <defs>
            <linearGradient id="fillgrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.25" />
              <stop offset="100%" stopColor="var(--accent)" stopOpacity="0" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      <div className="card glass" style={{ marginTop: "18px" }}>
        <div className="card-h">
          <h3>Chia sẻ báo cáo (chỉ đọc)</h3>
        </div>
        <p
          style={{
            fontSize: ".82rem",
            color: "var(--text-dim)",
            marginBottom: "8px",
          }}
        >
          Người nhận mã chỉ xem được báo cáo, không chỉnh sửa được dữ liệu.
        </p>
        <div className="sharebox">
          <svg width="18" height="18" style={{ color: "var(--text-dim)" }}>
            <use href="#i-percent" />
          </svg>
          <code>MW-2K6F-9X7A</code>
          <button className="btn" style={{ padding: "7px 12px" }}>
            <svg width="15" height="15" style={{ verticalAlign: "-2px" }}>
              <use href="#i-copy" />
            </svg>
          </button>
        </div>
      </div>
    </>
  );
}
