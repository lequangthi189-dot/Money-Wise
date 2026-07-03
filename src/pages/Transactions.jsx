const TXNS = [
  {
    id: 1,
    icon: "☕",
    cls: "c-coffee",
    name: "Trà sữa Phúc Long",
    date: "25/06",
    method: "Ví điện tử",
    type: "out",
    amount: "-35.000 ₫",
  },
  {
    id: 2,
    icon: "🍜",
    cls: "c-food",
    name: "Cơm trưa căng tin",
    date: "25/06",
    method: "Tiền mặt",
    type: "out",
    amount: "-45.000 ₫",
  },
  {
    id: 3,
    icon: "💰",
    cls: "c-salary",
    name: "Lương làm thêm",
    date: "24/06",
    method: "Chuyển khoản",
    type: "in",
    amount: "+1.500.000 ₫",
  },
  {
    id: 4,
    icon: "🛵",
    cls: "c-move",
    name: "Đổ xăng",
    date: "24/06",
    method: "Tiền mặt",
    type: "out",
    amount: "-65.000 ₫",
  },
  {
    id: 5,
    icon: "🎮",
    cls: "c-fun",
    name: "Vé xem phim CGV",
    date: "23/06",
    method: "Thẻ",
    type: "out",
    amount: "-120.000 ₫",
  },
  {
    id: 6,
    icon: "🎓",
    cls: "c-salary",
    name: "Học bổng kỳ 2",
    date: "22/06",
    method: "Chuyển khoản",
    type: "in",
    amount: "+2.000.000 ₫",
  },
];

export default function Transactions({ query = "" }) {
  const q = query.trim().toLowerCase();
  const filtered = q
    ? TXNS.filter(
        (tx) =>
          tx.name.toLowerCase().includes(q) ||
          tx.method.toLowerCase().includes(q) ||
          tx.amount.toLowerCase().includes(q) ||
          tx.date.includes(q),
      )
    : TXNS;

  return (
    <>
      <div className="grid g-12">
        <div className="card glass">
          <div className="card-h">
            <h3>Thêm giao dịch</h3>
          </div>
          <div className="field">
            <label>Loại giao dịch</label>
            <div className="seg">
              <button className="on out">Chi tiền</button>
              <button>Thu tiền</button>
            </div>
          </div>
          <div className="field">
            <label>Số tiền</label>
            <input defaultValue="35.000" placeholder="0 ₫" />
          </div>
          <div className="field">
            <label>Danh mục</label>
            <select>
              <option>☕ Cà phê/trà sữa</option>
              <option>🍜 Ăn uống</option>
              <option>🛵 Đi lại</option>
              <option>🎮 Giải trí</option>
            </select>
          </div>
          <div className="grid g-2" style={{ gap: "12px" }}>
            <div className="field">
              <label>Ngày</label>
              <input type="date" defaultValue="2026-06-25" />
            </div>
            <div className="field">
              <label>Phương thức</label>
              <select>
                <option>Ví điện tử</option>
                <option>Tiền mặt</option>
                <option>Thẻ</option>
              </select>
            </div>
          </div>
          <div className="field">
            <label>Ghi chú</label>
            <textarea
              placeholder="Ghi chú thêm…"
              defaultValue="Trà sữa Phúc Long"
            ></textarea>
          </div>
          <div className="btn-row">
            <button className="btn btn-primary" style={{ flex: "1" }}>
              Lưu giao dịch
            </button>
            <button className="btn">Hủy</button>
          </div>
          <div className="hr"></div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "9px",
              fontSize: ".78rem",
              color: "var(--text-dim)",
              cursor: "pointer",
            }}
          >
            <svg width="18" height="18" style={{ color: "var(--accent)" }}>
              <use href="#i-msg" />
            </svg>
            Hoặc nhập nhanh bằng chatbot AI →
          </div>
        </div>

        <div className="card glass">
          <div className="card-h">
            <h3>Danh sách giao dịch</h3>
            <div style={{ display: "flex", gap: "7px" }}>
              <span className="pill on">Tháng</span>
              <span className="pill">Tuần</span>
              <span className="pill">Ngày</span>
              <span className="pill">Danh mục</span>
            </div>
          </div>

          {q && (
            <div
              style={{
                fontSize: ".78rem",
                color: "var(--text-dim)",
                marginBottom: "10px",
              }}
            >
              Kết quả cho “{query}”: {filtered.length} giao dịch
            </div>
          )}

          {filtered.map((tx) => (
            <div className="tx" key={tx.id}>
              <div className={"cat " + tx.cls}>{tx.icon}</div>
              <div className="meta">
                <b>{tx.name}</b>
                <small>
                  {tx.date} · {tx.method}
                </small>
              </div>
              <span
                className={"badge " + (tx.type === "in" ? "b-in" : "b-out")}
              >
                {tx.type === "in" ? "Thu" : "Chi"}
              </span>
              <div
                className={"amt " + tx.type}
                style={{ minWidth: "90px", textAlign: "right" }}
              >
                {tx.amount}
              </div>
              <div className="act">
                <button>
                  <svg>
                    <use href="#i-edit" />
                  </svg>
                </button>
                <button>
                  <svg>
                    <use href="#i-trash" />
                  </svg>
                </button>
              </div>
            </div>
          ))}

          {filtered.length === 0 && (
            <div
              style={{
                padding: "26px 10px",
                textAlign: "center",
                color: "var(--text-dim)",
                fontSize: ".85rem",
              }}
            >
              Không tìm thấy giao dịch nào khớp “{query}”.
            </div>
          )}
        </div>
      </div>
    </>
  );
}
