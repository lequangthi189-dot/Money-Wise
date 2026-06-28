export default function Transactions() {
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
          <div className="tx">
            <div className="cat c-coffee">☕</div>
            <div className="meta">
              <b>Trà sữa Phúc Long</b>
              <small>25/06 · Ví điện tử</small>
            </div>
            <span className="badge b-out">Chi</span>
            <div
              className="amt out"
              style={{ minWidth: "90px", textAlign: "right" }}
            >
              -35.000 ₫
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
          <div className="tx">
            <div className="cat c-food">🍜</div>
            <div className="meta">
              <b>Cơm trưa căng tin</b>
              <small>25/06 · Tiền mặt</small>
            </div>
            <span className="badge b-out">Chi</span>
            <div
              className="amt out"
              style={{ minWidth: "90px", textAlign: "right" }}
            >
              -45.000 ₫
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
          <div className="tx">
            <div className="cat c-salary">💰</div>
            <div className="meta">
              <b>Lương làm thêm</b>
              <small>24/06 · Chuyển khoản</small>
            </div>
            <span className="badge b-in">Thu</span>
            <div
              className="amt in"
              style={{ minWidth: "90px", textAlign: "right" }}
            >
              +1.500.000 ₫
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
          <div className="tx">
            <div className="cat c-move">🛵</div>
            <div className="meta">
              <b>Đổ xăng</b>
              <small>24/06 · Tiền mặt</small>
            </div>
            <span className="badge b-out">Chi</span>
            <div
              className="amt out"
              style={{ minWidth: "90px", textAlign: "right" }}
            >
              -65.000 ₫
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
          <div className="tx">
            <div className="cat c-fun">🎮</div>
            <div className="meta">
              <b>Vé xem phim CGV</b>
              <small>23/06 · Thẻ</small>
            </div>
            <span className="badge b-out">Chi</span>
            <div
              className="amt out"
              style={{ minWidth: "90px", textAlign: "right" }}
            >
              -120.000 ₫
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
          <div className="tx">
            <div className="cat c-salary">🎓</div>
            <div className="meta">
              <b>Học bổng kỳ 2</b>
              <small>22/06 · Chuyển khoản</small>
            </div>
            <span className="badge b-in">Thu</span>
            <div
              className="amt in"
              style={{ minWidth: "90px", textAlign: "right" }}
            >
              +2.000.000 ₫
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
        </div>
      </div>
    </>
  );
}
