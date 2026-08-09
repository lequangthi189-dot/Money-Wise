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

// Hỗ trợ cả dạng đầy đủ và viết tắt: 35.000, 35k, 1,5tr, 1tr5.
export function parseMoney(text) {
  const input = String(text ?? "").trim().toLowerCase().replace(/₫|đ/g, "").trim();
  const compact = input.replace(/\s+/g, "");

  const mixedMillions = compact.match(/^(\d+)tr(\d+)$/);
  if (mixedMillions) {
    const whole = Number(mixedMillions[1]);
    const fractionText = mixedMillions[2];
    return Math.round((whole + Number(fractionText) / (10 ** fractionText.length)) * 1_000_000);
  }

  const abbreviated = compact.match(/^(\d+(?:[.,]\d+)?)(k|nghìn|nghin|tr|triệu|trieu|m)$/);
  if (abbreviated) {
    const [, rawNumber, unit] = abbreviated;
    const separator = rawNumber.match(/[.,](\d+)$/);
    const numeric = separator && separator[1].length <= 2
      ? Number(rawNumber.replace(",", "."))
      : Number(rawNumber.replace(/[.,]/g, ""));
    const multiplier = ["k", "nghìn", "nghin"].includes(unit) ? 1_000 : 1_000_000;
    return Number.isFinite(numeric) ? Math.round(numeric * multiplier) : NaN;
  }

  // Số tiền đầy đủ chỉ được chứa chữ số và dấu phân cách. Không tự ý bỏ chữ
  // khỏi chuỗi, vì "abc98035" không phải là một số tiền hợp lệ.
  if (!/^\d+(?:[.,]\d+)*$/.test(compact)) return NaN;
  const digits = compact.replace(/[.,]/g, "");
  return Number(digits);
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
