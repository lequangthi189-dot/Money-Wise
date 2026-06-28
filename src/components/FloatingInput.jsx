import { useState } from "react";
import "./FloatingInput.css";

// Ô nhập "Premium": nhãn nổi trượt lên viền khi focus / có chữ.
// - maxLength  -> hiện bộ đếm ký tự (vd 21/30)
// - type="password" -> tự có nút ẩn/hiện mật khẩu
// - left + leftPad -> chèn phần phụ bên trái (vd select mã quốc gia cho ô điện thoại)
export default function FloatingInput({
  label,
  value,
  onChange,
  type = "text",
  maxLength,
  name,
  autoComplete,
  inputMode,
  left = null,
  leftPad = 0,
}) {
  const [show, setShow] = useState(false);
  const isPw = type === "password";
  const inputType = isPw ? (show ? "text" : "password") : type;
  const len = (value ?? "").length;
  const hasCounter = typeof maxLength === "number";
  const padRight = isPw ? 40 : hasCounter ? 52 : undefined;
  const labelLeft = leftPad ? leftPad + 14 : 12;

  return (
    <div className="flf">
      <div className="flf-box">
        {left}
        <input
          className="flf-input"
          type={inputType}
          value={value}
          onChange={onChange}
          placeholder=" "
          maxLength={maxLength}
          name={name}
          autoComplete={autoComplete}
          inputMode={inputMode}
          style={padRight ? { paddingRight: padRight } : undefined}
        />
        <label className="flf-label" style={{ left: labelLeft }}>
          {label}
        </label>

        {hasCounter && (
          <span className="flf-counter">
            {len}/{maxLength}
          </span>
        )}

        {isPw && (
          <button
            type="button"
            className="flf-eye"
            onClick={() => setShow((s) => !s)}
            aria-label="Hiện/ẩn mật khẩu"
          >
            {show ? <EyeOff /> : <Eye />}
          </button>
        )}
      </div>
    </div>
  );
}

function Eye() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7-10-7-10-7z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function EyeOff() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M9.9 4.24A9.1 9.1 0 0 1 12 5c6.4 0 10 7 10 7a13.3 13.3 0 0 1-1.7 2.4M6.6 6.6A13.3 13.3 0 0 0 2 12s3.6 7 10 7a9.1 9.1 0 0 0 4.2-1" />
      <path d="M9.9 9.9a3 3 0 0 0 4.2 4.2M1 1l22 22" />
    </svg>
  );
}
