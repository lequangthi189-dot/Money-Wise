export default function Goals() {
  return (
    <>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "18px",
        }}
      >
        <div>
          <h2 style={{ fontSize: "1.05rem", fontWeight: "600" }}>
            Mục tiêu tiết kiệm
          </h2>
          <p style={{ fontSize: ".8rem", color: "var(--text-dim)" }}>
            Theo dõi tiến độ tích lũy & dự báo lãi suất
          </p>
        </div>
        <button className="btn btn-primary">
          <svg
            width="16"
            height="16"
            style={{ verticalAlign: "-3px", marginRight: "5px" }}
          >
            <use href="#i-plus" />
          </svg>
          Tạo mục tiêu
        </button>
      </div>

      <div className="grid g-3">
        <div className="goalcard glass">
          <div className="gh">
            <div className="ico c-shop">📱</div>
            <div>
              <b>Mua điện thoại</b>
              <small>Mục tiêu: 15.000.000 ₫</small>
            </div>
          </div>
          <div className="track" style={{ height: "11px" }}>
            <div className="bar" style={{ width: "61%" }}></div>
          </div>
          <div className="nums">
            <span>
              Đã tích lũy <b>9.200.000 ₫</b>
            </span>
            <span>
              <b>61%</b>
            </span>
          </div>
          <div className="forecast">
            <svg width="16" height="16">
              <use href="#i-clock" />
            </svg>
            Lãi suất 5,5%/năm · Dự kiến đạt <b>tháng 11/2026</b>
          </div>
        </div>
        <div className="goalcard glass">
          <div className="gh">
            <div className="ico c-fun">✈️</div>
            <div>
              <b>Du lịch Đà Lạt</b>
              <small>Mục tiêu: 5.000.000 ₫</small>
            </div>
          </div>
          <div className="track" style={{ height: "11px" }}>
            <div className="bar ok" style={{ width: "62%" }}></div>
          </div>
          <div className="nums">
            <span>
              Đã tích lũy <b>3.100.000 ₫</b>
            </span>
            <span>
              <b>62%</b>
            </span>
          </div>
          <div className="forecast">
            <svg width="16" height="16">
              <use href="#i-clock" />
            </svg>
            Lãi suất 0,3%/tháng · Dự kiến đạt <b>tháng 9/2026</b>
          </div>
        </div>
        <div className="goalcard glass">
          <div className="gh">
            <div className="ico c-edu">💻</div>
            <div>
              <b>Mua laptop</b>
              <small>Mục tiêu: 25.000.000 ₫</small>
            </div>
          </div>
          <div className="track" style={{ height: "11px" }}>
            <div className="bar" style={{ width: "16%" }}></div>
          </div>
          <div className="nums">
            <span>
              Đã tích lũy <b>4.000.000 ₫</b>
            </span>
            <span>
              <b>16%</b>
            </span>
          </div>
          <div className="forecast">
            <svg width="16" height="16">
              <use href="#i-clock" />
            </svg>
            Lãi suất 6%/năm · Dự kiến đạt <b>tháng 8/2027</b>
          </div>
        </div>
      </div>

      <div className="card glass" style={{ marginTop: "18px" }}>
        <div className="card-h">
          <h3>Tạo mục tiêu mới</h3>
        </div>
        <div className="grid g-3" style={{ gap: "14px" }}>
          <div className="field">
            <label>Tên mục tiêu</label>
            <input placeholder="VD: Mua xe máy" />
          </div>
          <div className="field">
            <label>Số tiền mục tiêu</label>
            <input placeholder="0 ₫" />
          </div>
          <div className="field">
            <label>Lãi suất</label>
            <div style={{ display: "flex", gap: "8px" }}>
              <input placeholder="5,5" style={{ flex: "1" }} />
              <select style={{ width: "auto" }}>
                <option>%/năm</option>
                <option>%/tháng</option>
              </select>
            </div>
          </div>
          <div className="field">
            <label>Góp thêm mỗi tháng</label>
            <input placeholder="0 ₫" />
          </div>
          <div className="field">
            <label>Số dư ban đầu</label>
            <input placeholder="0 ₫" />
          </div>
          <div
            className="field"
            style={{ display: "flex", alignItems: "flex-end" }}
          >
            <button className="btn btn-primary" style={{ width: "100%" }}>
              Tạo & dự báo
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
