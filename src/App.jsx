import { useState, useEffect } from "react";
import "./App.css";
import "./Theme-Lg.css";
import Auth from "./Auth";

const i18n = {
  vi: {
    brandSub: "Quản lý tài chính",
    streak: "Chuỗi ghi chép",
    streakDays: (n) => `${n} ngày`,
    search: "Tìm giao dịch, danh mục…",
    nav: {
      dashboard: "Tổng quan",
      transactions: "Giao dịch",
      categories: "Danh mục",
      budgets: "Hạn mức",
      reports: "Báo cáo",
      goals: "Mục tiêu",
      settings: "Cài đặt",
    },
    group: { overview: "Tổng quan", manage: "Quản lý", other: "Khác" },
    titles: {
      dashboard: ["Tổng quan", "Chào buổi tối, Thi 👋"],
      transactions: ["Giao dịch", "Ghi lại & quản lý thu chi"],
      categories: ["Danh mục", "Quản lý danh mục thu chi"],
      budgets: ["Hạn mức", "Kiểm soát chi tiêu theo ngưỡng"],
      reports: ["Báo cáo", "Thống kê tài chính tháng"],
      goals: ["Mục tiêu", "Tiết kiệm & dự báo lãi suất"],
      settings: ["Cài đặt", "Giao diện & tài khoản"],
    },
    settings: {
      theme: "Phong cách giao diện",
      themeSub: "Áp dụng ngay, lưu theo tài khoản",
      display: "Hiển thị",
      fontSize: "Cỡ chữ",
      language: "Ngôn ngữ",
      widgets: "Sắp xếp widget tổng quan",
      widgetList: [
        "Thẻ số dư & chi tiêu",
        "Biểu đồ chi theo danh mục",
        "Mục tiêu tiết kiệm",
      ],
      account: "Tài khoản",
      name: "Họ tên",
      email: "Email",
      phone: "Số điện thoại",
      changePw: "Đổi mật khẩu",
      logout: "Đăng xuất",
    },
  },
  en: {
    brandSub: "Money management",
    streak: "Logging streak",
    streakDays: (n) => `${n} days`,
    search: "Search transactions, categories…",
    nav: {
      dashboard: "Overview",
      transactions: "Transactions",
      categories: "Categories",
      budgets: "Budgets",
      reports: "Reports",
      goals: "Goals",
      settings: "Settings",
    },
    group: { overview: "Overview", manage: "Manage", other: "Other" },
    titles: {
      dashboard: ["Overview", "Good evening, Thi 👋"],
      transactions: ["Transactions", "Record & manage income/expense"],
      categories: ["Categories", "Manage income & expense categories"],
      budgets: ["Budgets", "Control spending by threshold"],
      reports: ["Reports", "Monthly financial statistics"],
      goals: ["Goals", "Savings & interest forecast"],
      settings: ["Settings", "Interface & account"],
    },
    settings: {
      theme: "Interface style",
      themeSub: "Applied instantly, saved per account",
      display: "Display",
      fontSize: "Font size",
      language: "Language",
      widgets: "Reorder overview widgets",
      widgetList: [
        "Balance & spending cards",
        "Spending by category chart",
        "Savings goals",
      ],
      account: "Account",
      name: "Full name",
      email: "Email",
      phone: "Phone number",
      changePw: "Change password",
      logout: "Log out",
    },
  },
};
const NAV = [
  { group: "overview" },
  { id: "dashboard", icon: "i-grid" },
  { id: "transactions", icon: "i-swap" },
  { group: "manage" },
  { id: "categories", icon: "i-tag" },
  { id: "budgets", icon: "i-gauge" },
  { id: "reports", icon: "i-chart" },
  { id: "goals", icon: "i-flag" },
  { group: "other" },
  { id: "settings", icon: "i-gear" },
];

const THEMES = [
  {
    id: "glass",
    dot: "td-glass",
    prev: "pv-glass",
    name: "Modern Glassmorphism",
  },
  {
    id: "dark",
    dot: "td-dark",
    prev: "pv-dark",
    name: "Sleek Dark Minimalist",
  },
  { id: "neu", dot: "td-neu", prev: "pv-neu", name: "Soft UI / Neumorphism" },
];

function Icon({ n, size = 20 }) {
  return (
    <svg width={size} height={size}>
      <use href={"#" + n} />
    </svg>
  );
}

function FlagVN() {
  return (
    <svg
      viewBox="0 0 30 20"
      width="28"
      height="28"
      preserveAspectRatio="xMidYMid slice"
      style={{ display: "block", borderRadius: "50%" }}
    >
      <rect width="30" height="20" fill="#da251d" />
      <polygon
        points="15,4 16.35,8.15 20.71,8.15 17.18,10.71 18.53,14.85 15,12.29 11.47,14.85 12.82,10.71 9.29,8.15 13.65,8.15"
        fill="#ffff00"
      />
    </svg>
  );
}

function FlagGB() {
  return (
    <svg
      viewBox="0 0 60 30"
      width="28"
      height="28"
      preserveAspectRatio="xMidYMid slice"
      style={{ display: "block", borderRadius: "50%" }}
    >
      <clipPath id="gb-clip">
        <path d="M0,0 v30 h60 v-30 z" />
      </clipPath>
      <clipPath id="gb-diag">
        <path d="M30,15 h30 v15 z v15 h-30 z h-30 v-15 z v-15 h30 z" />
      </clipPath>
      <g clipPath="url(#gb-clip)">
        <path d="M0,0 v30 h60 v-30 z" fill="#012169" />
        <path d="M0,0 L60,30 M60,0 L0,30" stroke="#ffffff" strokeWidth="6" />
        <path
          d="M0,0 L60,30 M60,0 L0,30"
          clipPath="url(#gb-diag)"
          stroke="#c8102e"
          strokeWidth="4"
        />
        <path d="M30,0 v30 M0,15 h60" stroke="#ffffff" strokeWidth="10" />
        <path d="M30,0 v30 M0,15 h60" stroke="#c8102e" strokeWidth="6" />
      </g>
    </svg>
  );
}

function Sprite() {
  return (
    <svg
      width="0"
      height="0"
      style={{ position: "absolute" }}
      aria-hidden="true"
    >
      <symbol
        id="i-wallet"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M19 7V5a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a1 1 0 0 0 1-1v-2" />
        <path d="M3 5v14a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1v-4" />
      </symbol>
      <symbol
        id="i-grid"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <rect x="3" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="14" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" />
      </symbol>
      <symbol
        id="i-swap"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M7 16V4M7 4 3 8M7 4l4 4M17 8v12M17 20l4-4M17 20l-4-4" />
      </symbol>
      <symbol
        id="i-tag"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M7.5 7.5h.01M3 3h7l11 11-7 7L3 10V3z" />
      </symbol>
      <symbol
        id="i-gauge"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M12 14 18 8M3.34 19a10 10 0 1 1 17.32 0" />
      </symbol>
      <symbol
        id="i-chart"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M3 3v18h18M7 14l4-4 4 3 5-6" />
      </symbol>
      <symbol
        id="i-flag"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M4 22V4M4 4h13l-2 4 2 4H4" />
      </symbol>
      <symbol
        id="i-gear"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09a1.65 1.65 0 0 0-1.08-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09a1.65 1.65 0 0 0 1.51-1.08 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
      </symbol>
      <symbol
        id="i-search"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="11" cy="11" r="8" />
        <path d="m21 21-4.3-4.3" />
      </symbol>
      <symbol
        id="i-bell"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9M10.3 21a1.94 1.94 0 0 0 3.4 0" />
      </symbol>
      <symbol
        id="i-plus"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M12 5v14M5 12h14" />
      </symbol>
      <symbol
        id="i-edit"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
        <path d="M18.5 2.5a2.12 2.12 0 0 1 3 3L12 15l-4 1 1-4z" />
      </symbol>
      <symbol
        id="i-trash"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
      </symbol>
      <symbol
        id="i-msg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
      </symbol>
      <symbol
        id="i-send"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="m22 2-7 20-4-9-9-4z" />
        <path d="M22 2 11 13" />
      </symbol>
      <symbol
        id="i-logout"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" />
      </symbol>
      <symbol
        id="i-warn"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0zM12 9v4M12 17h.01" />
      </symbol>
      <symbol
        id="i-copy"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <rect x="9" y="9" width="13" height="13" rx="2" />
        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
      </symbol>
      <symbol
        id="i-clock"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7v5l3 2" />
      </symbol>
      <symbol
        id="i-percent"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M19 5 5 19" />
        <circle cx="6.5" cy="6.5" r="2.5" />
        <circle cx="17.5" cy="17.5" r="2.5" />
      </symbol>
    </svg>
  );
}

function Dashboard() {
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

function Transactions() {
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

function Categories() {
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

function Budgets() {
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

function Reports() {
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

function Goals() {
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

function Settings({
  theme,
  setTheme,
  fontSize,
  setFontSize,
  lang,
  setLang,
  s,
}) {
  return (
    <>
      <div className="card glass" style={{ marginBottom: "18px" }}>
        <div className="card-h">
          <h3>{s.theme}</h3>
          <span className="muted">{s.themeSub}</span>
        </div>
        <div className="themecards">
          {THEMES.map((t) => (
            <div
              key={t.id}
              className={"themecard" + (theme === t.id ? " sel" : "")}
              onClick={() => setTheme(t.id)}
            >
              <div className={"prev " + t.prev}>
                <div className="mini" style={{ width: "60%" }}></div>
                <div className="mini" style={{ width: "90%" }}></div>
                <div className="mini" style={{ width: "75%" }}></div>
              </div>
              <div className="nm">{t.name}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid g-2">
        <div className="card glass">
          <div className="card-h">
            <h3>{s.display}</h3>
          </div>
          <div className="field">
            <label>
              {s.fontSize} ({fontSize}px)
            </label>
            <input
              type="range"
              min="14"
              max="20"
              value={fontSize}
              onChange={(e) => setFontSize(+e.target.value)}
            />
          </div>
          <div className="field">
            <label>{s.language}</label>
            <select value={lang} onChange={(e) => setLang(e.target.value)}>
              <option value="vi">Tiếng Việt</option>
              <option value="en">English</option>
            </select>
          </div>
          <div className="field">
            <label>{s.widgets}</label>
            <div
              style={{ display: "flex", flexDirection: "column", gap: "8px" }}
            >
              {s.widgetList.map((w, i) => (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    padding: "10px 12px",
                    borderRadius: "10px",
                    background: "var(--surface-2)",
                  }}
                >
                  ⠿ {w}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="card glass">
          <div className="card-h">
            <h3>{s.account}</h3>
          </div>
          <div className="field">
            <label>{s.name}</label>
            <input defaultValue="Thi Nguyễn" />
          </div>
          <div className="field">
            <label>{s.email}</label>
            <input defaultValue="thi@huflit.edu.vn" />
          </div>
          <div className="field">
            <label>{s.phone}</label>
            <input defaultValue="0909 xxx xxx" />
          </div>
          <div className="btn-row">
            <button className="btn" style={{ flex: "1" }}>
              {s.changePw}
            </button>
            <button className="btn" style={{ color: "var(--danger)" }}>
              <Icon n="i-logout" size={15} /> {s.logout}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

function ChatPanel({ onClose }) {
  return (
    <div className="chatpanel show">
      <div className="chathead">
        <div className="bot">
          <Icon n="i-msg" />
        </div>
        <div>
          <b>Trợ lý MoneyWise</b>
          <small>● Đang hoạt động</small>
        </div>
        <button className="x" onClick={onClose}>
          ×
        </button>
      </div>
      <div className="chatbody">
        <div className="msg bot">
          Chào Thi! Bạn vừa chi gì? Cứ gõ tự nhiên, mình ghi giúp 👇
        </div>
        <div className="msg me">hôm nay mình uống trà sữa 35k</div>
        <div className="msg bot">
          Mình đã hiểu! Kiểm tra giúp mình nhé:
          <div className="parsed">
            <div className="pr">
              <span>Số tiền</span>
              <b>35.000 ₫</b>
            </div>
            <div className="pr">
              <span>Loại</span>
              <b>Chi</b>
            </div>
            <div className="pr">
              <span>Danh mục</span>
              <b>☕ Cà phê/trà sữa</b>
            </div>
            <div className="pr">
              <span>Ngày</span>
              <b>25/06/2026</b>
            </div>
            <div className="pbtn">
              <button className="ok">✓ Lưu</button>
              <button className="edit">Chỉnh sửa</button>
            </div>
          </div>
        </div>
      </div>
      <div className="chatfoot">
        <input placeholder="Nhập khoản chi…" />
        <button className="send">
          <Icon n="i-send" size={18} />
        </button>
      </div>
    </div>
  );
}

const VIEWS = {
  dashboard: Dashboard,
  transactions: Transactions,
  categories: Categories,
  budgets: Budgets,
  reports: Reports,
  goals: Goals,
};

export default function App() {
  const [view, setView] = useState("dashboard");
  const [theme, setTheme] = useState("glass");
  const [lang, setLang] = useState("vi");
  const [chatOpen, setChatOpen] = useState(false);
  const [fontSize, setFontSize] = useState(16);
  const [authed, setAuthed] = useState(false);

  useEffect(() => {
    document.documentElement.style.fontSize = fontSize + "px";
  }, [fontSize]);

  if (!authed)
    return (
      <Auth
        onAuthed={() => setAuthed(true)}
        theme={theme}
        setTheme={setTheme}
      />
    );

  const t = i18n[lang];
  const [title, sub] = t.titles[view];
  const ViewComp = VIEWS[view];
  const currentTheme = THEMES.find((th) => th.id === theme) ?? THEMES[0];
  const currentThemeIndex = THEMES.findIndex((th) => th.id === currentTheme.id);
  const nextTheme = THEMES[(currentThemeIndex + 1) % THEMES.length];

  return (
    <div className="root" data-theme={theme}>
      <Sprite />
      <div className="app">
        <aside className="sidebar">
          <div className="brand">
            <div className="logo">
              <Icon n="i-wallet" />
            </div>
            <div>
              <b>MoneyWise</b>
              <small>{t.brandSub}</small>
            </div>
          </div>

          <div className="streak">
            <span className="fire" style={{ fontSize: "1.2rem" }}>
              🔥
            </span>
            <div>
              <b>{t.streakDays(12)}</b>
              <span>{t.streak}</span>
            </div>
          </div>

          <nav className="nav">
            {NAV.map((item, i) =>
              item.group ? (
                <div key={i} className="nav-label">
                  {t.group[item.group]}
                </div>
              ) : (
                <div
                  key={i}
                  className={"nav-link" + (view === item.id ? " active" : "")}
                  onClick={() => setView(item.id)}
                >
                  <Icon n={item.icon} />
                  <span>{t.nav[item.id]}</span>
                </div>
              ),
            )}
          </nav>

          <div className="nav-spacer"></div>
          <div className="nav-foot">
            <div className="userchip">
              <div className="ava">TH</div>
              <div style={{ flex: "1" }}>
                <b>Thi Nguyễn</b>
                <small>thi@huflit.edu.vn</small>
              </div>
              <Icon n="i-logout" size={17} />
            </div>
          </div>
        </aside>

        <main className="main">
          <header className="topbar">
            <div className="page-title">
              <h1>{title}</h1>
              <p>{sub}</p>
            </div>
            <div className="top-actions">
              <div className="search">
                <Icon n="i-search" size={16} />
                <input placeholder={t.search} />
              </div>

              <div className="themeswitch">
                <div
                  className={"theme-dot " + currentTheme.dot + " sel"}
                  title={`${currentTheme.name} - click to switch ${nextTheme.name}`}
                  onClick={() => setTheme(nextTheme.id)}
                ></div>
              </div>

              {/* Dot đổi ngôn ngữ: bấm để chuyển Việt <-> Anh */}
              <div className="themeswitch">
                <div
                  className="theme-dot"
                  style={{ overflow: "hidden", padding: 0, border: "none" }}
                  title={
                    lang === "vi"
                      ? "Tiếng Việt — bấm để chuyển English"
                      : "English — click to switch Tiếng Việt"
                  }
                  onClick={() => setLang((l) => (l === "vi" ? "en" : "vi"))}
                >
                  {lang === "vi" ? <FlagVN /> : <FlagGB />}
                </div>
              </div>

              <div className="icon-btn">
                <Icon n="i-bell" size={19} />
                <span className="dot"></span>
              </div>
            </div>
          </header>

          <div className="content">
            <section className="view show" key={view}>
              {view === "settings" ? (
                <Settings
                  theme={theme}
                  setTheme={setTheme}
                  fontSize={fontSize}
                  setFontSize={setFontSize}
                  lang={lang}
                  setLang={setLang}
                  s={t.settings}
                />
              ) : (
                <ViewComp />
              )}
            </section>
          </div>
        </main>
      </div>

      <button className="fab" onClick={() => setChatOpen((o) => !o)}>
        <Icon n="i-msg" size={26} />
      </button>
      {chatOpen && <ChatPanel onClose={() => setChatOpen(false)} />}
    </div>
  );
}
