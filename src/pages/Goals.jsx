import { Icon } from "../components/icons";

const goals = [
  {
    name: "Mua điện thoại",
    icon: "📱",
    saved: "9.200.000",
    target: "15.000.000",
    percent: 61,
    due: "Còn 4 tháng",
    color: "#60a5fa",
    forecast: "Cần tiết kiệm 1.450.000 đ/tháng để đạt mục tiêu.",
  },
  {
    name: "Du lịch Đà Lạt",
    icon: "✈️",
    saved: "3.100.000",
    target: "5.000.000",
    percent: 62,
    due: "Còn 2 tháng",
    color: "#34d399",
    forecast: "Theo tiến độ hiện tại, mục tiêu có thể hoàn thành sớm 1 tuần.",
  },
  {
    name: "Mua laptop",
    icon: "💻",
    saved: "4.000.000",
    target: "25.000.000",
    percent: 16,
    due: "Còn 10 tháng",
    color: "#a78bfa",
    forecast: "Tăng thêm 900.000 đ/tháng để bắt kịp kế hoạch.",
  },
];

export default function Goals() {
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
        <button className="btn btn-primary">
          <Icon n="i-plus" size={16} /> Thêm mục tiêu
        </button>
        <div style={{ flex: "1" }}></div>
        <select style={{ width: "auto" }}>
          <option>Đang thực hiện</option>
          <option>Đã hoàn thành</option>
          <option>Tất cả mục tiêu</option>
        </select>
      </div>

      <div className="grid g-3">
        {goals.map((goal) => (
          <div className="goalcard glass" key={goal.name}>
            <div className="gh">
              <div className="ico" style={{ background: goal.color + "22" }}>
                {goal.icon}
              </div>
              <div>
                <b>{goal.name}</b>
                <small>{goal.due}</small>
              </div>
            </div>

            <div className="nums">
              <span>
                <b>{goal.saved} đ</b> đã có
              </span>
              <span>{goal.target} đ</span>
            </div>
            <div className="track">
              <div
                className={goal.percent >= 60 ? "bar ok" : "bar"}
                style={{ width: goal.percent + "%" }}
              ></div>
            </div>
            <div className="nums">
              <span>Tiến độ</span>
              <b>{goal.percent}%</b>
            </div>

            <div className="forecast">
              <Icon n="i-clock" size={15} />
              <span>{goal.forecast}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid g-12" style={{ marginTop: "18px" }}>
        <div className="card glass">
          <div className="card-h">
            <h3>Tạo mục tiêu mới</h3>
            <span className="muted">Ước tính tiến độ tiết kiệm</span>
          </div>
          <div className="field">
            <label>Tên mục tiêu</label>
            <input placeholder="Ví dụ: Quỹ dự phòng" />
          </div>
          <div className="field">
            <label>Số tiền mục tiêu</label>
            <input placeholder="0 đ" />
          </div>
          <div className="field">
            <label>Ngày hoàn thành</label>
            <input type="date" />
          </div>
          <button className="btn btn-primary" style={{ width: "100%" }}>
            Lưu mục tiêu
          </button>
        </div>

        <div className="card glass">
          <div className="card-h">
            <h3>Tổng quan mục tiêu</h3>
            <span className="muted">3 mục tiêu đang chạy</span>
          </div>
          <div className="grid g-3">
            <div className="stat glass">
              <div className="row">
                <label>Đã tiết kiệm</label>
                <div className="ico ico-ok">
                  <Icon n="i-wallet" />
                </div>
              </div>
              <div className="val sm">16.300.000 đ</div>
            </div>
            <div className="stat glass">
              <div className="row">
                <label>Cần đạt</label>
                <div className="ico ico-pri">
                  <Icon n="i-flag" />
                </div>
              </div>
              <div className="val sm">45.000.000 đ</div>
            </div>
            <div className="stat glass">
              <div className="row">
                <label>Bình quân</label>
                <div className="ico ico-warn">
                  <Icon n="i-percent" />
                </div>
              </div>
              <div className="val sm">46%</div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
