// Model: định dạng tiền và ngày. DB lưu số (numeric) và date, UI hiển thị
// chuỗi có dấu phân cách — mọi chỗ quy đổi đi qua đây để không lệch nhau.

const vnd = new Intl.NumberFormat("vi-VN");

// 35000 -> "35.000 ₫"
export function fmtMoney(n) {
  return vnd.format(Number(n) || 0) + " ₫";
}

// 35000, 'out' -> "-35.000 ₫" (dấu dùng cho danh sách giao dịch)
export function fmtSigned(n, type) {
  return (type === "in" ? "+" : "-") + fmtMoney(n);
}

// "35.000" | "35,000 ₫" -> 35000. Trả NaN nếu không đọc được.
export function parseMoney(text) {
  const digits = String(text ?? "").replace(/[^\d]/g, "");
  return digits === "" ? NaN : Number(digits);
}

// "2026-06-25" -> "25/06"
export function fmtDayMonth(iso) {
  if (!iso) return "";
  const [, m, d] = iso.split("-");
  return `${d}/${m}`;
}

// Ngày hôm nay theo giờ máy, dạng "YYYY-MM-DD" cho input[type=date].
export function todayISO() {
  const d = new Date();
  const p = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}
