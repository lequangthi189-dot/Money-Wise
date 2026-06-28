export default function Categories() {
  return (
    <>
      <div className="card glass">
        <div className="card-h">
          <div>
            <h3>Danh mục chi tiêu</h3>
            <span className="muted">8 mặc định · 3 tự tạo · tối đa 20</span>
          </div>
          <button className="btn btn-primary">
            <svg
              width="16"
              height="16"
              style={{ verticalAlign: "-3px", marginRight: "5px" }}
            >
              <use href="#i-plus" />
            </svg>
            Thêm danh mục
          </button>
        </div>
        <div
          style={{
            fontSize: ".72rem",
            textTransform: "uppercase",
            letterSpacing: ".1em",
            color: "var(--text-faint)",
            marginBottom: "11px",
          }}
        >
          Danh mục chi
        </div>
        <div className="catgrid">
          <div className="catcard">
            <div className="cat c-food">🍜</div>
            <div className="meta">
              <b>Ăn uống</b>
            </div>
            <span className="badge b-out">Chi</span>
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
          <div className="catcard">
            <div className="cat c-move">🛵</div>
            <div className="meta">
              <b>Đi lại</b>
            </div>
            <span className="badge b-out">Chi</span>
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
          <div className="catcard">
            <div className="cat c-edu">📚</div>
            <div className="meta">
              <b>Học phí</b>
            </div>
            <span className="badge b-out">Chi</span>
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
          <div className="catcard">
            <div className="cat c-rent">🏠</div>
            <div className="meta">
              <b>Thuê trọ</b>
            </div>
            <span className="badge b-out">Chi</span>
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
          <div className="catcard">
            <div className="cat c-fun">🎮</div>
            <div className="meta">
              <b>Giải trí</b>
            </div>
            <span className="badge b-out">Chi</span>
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
          <div className="catcard">
            <div className="cat c-shop">🛍️</div>
            <div className="meta">
              <b>Mua sắm</b>
            </div>
            <span className="badge b-out">Chi</span>
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
          <div className="catcard">
            <div className="cat c-coffee">☕</div>
            <div className="meta">
              <b>Cà phê/trà sữa</b>
            </div>
            <span className="badge b-out">Chi</span>
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
          <div className="catcard">
            <div className="cat c-health">❤️</div>
            <div className="meta">
              <b>Sức khỏe</b>
            </div>
            <span className="badge b-out">Chi</span>
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
        <div
          style={{
            fontSize: ".72rem",
            textTransform: "uppercase",
            letterSpacing: ".1em",
            color: "var(--text-faint)",
            margin: "20px 0 11px",
          }}
        >
          Danh mục thu
        </div>
        <div className="catgrid">
          <div className="catcard">
            <div className="cat c-salary">💰</div>
            <div className="meta">
              <b>Lương làm thêm</b>
            </div>
            <span className="badge b-in">Thu</span>
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
          <div className="catcard">
            <div className="cat c-salary">👨‍👩‍👧</div>
            <div className="meta">
              <b>Bố mẹ gửi</b>
            </div>
            <span className="badge b-in">Thu</span>
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
          <div className="catcard">
            <div className="cat c-salary">🎓</div>
            <div className="meta">
              <b>Học bổng</b>
            </div>
            <span className="badge b-in">Thu</span>
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
