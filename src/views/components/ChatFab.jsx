import { useEffect, useRef, useState } from "react";
import { Icon } from "./icons";

// Nút nổi mở chatbot, kéo thả được. Vị trí lưu vào localStorage nên giữ
// nguyên sau khi tải lại trang; chưa kéo lần nào thì để trống cho .fab trong
// chatpanel.css tự đặt góc phải dưới (kèm các media query của nó).
const STORAGE_KEY = "moneywise-vi-tri-nut-chat";
// Nhích dưới ngưỡng này tính là bấm chứ không phải kéo — chuột hay run tay
// trên cảm ứng đều lệch vài pixel, không có ngưỡng thì bấm mãi không mở được.
const NGUONG_KEO = 4;
const LE = 8;

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function docViTri() {
  try {
    const pos = JSON.parse(localStorage.getItem(STORAGE_KEY));
    return typeof pos?.left === "number" && typeof pos?.top === "number"
      ? pos
      : null;
  } catch {
    return null;
  }
}

function luuViTri(pos) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(pos));
  } catch {
    // Trình duyệt chặn storage thì bỏ qua, nút vẫn kéo được trong phiên này.
  }
}

export default function ChatFab({ label, onToggle }) {
  const [pos, setPos] = useState(docViTri);
  const [dragging, setDragging] = useState(false);
  const ref = useRef(null);
  const keo = useRef(null);
  const vuaKeo = useRef(false);

  // Cửa sổ thu nhỏ có thể bỏ nút ra ngoài màn hình, kéo lại vào trong biên.
  useEffect(() => {
    function onResize() {
      const el = ref.current;
      if (!el) return;
      const { width, height } = el.getBoundingClientRect();
      setPos((p) => {
        if (!p) return p;
        const next = {
          left: clamp(p.left, LE, window.innerWidth - width - LE),
          top: clamp(p.top, LE, window.innerHeight - height - LE),
        };
        if (next.left === p.left && next.top === p.top) return p;
        luuViTri(next);
        return next;
      });
    }
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  function onPointerDown(event) {
    if (event.pointerType === "mouse" && event.button !== 0) return;
    const rect = ref.current.getBoundingClientRect();
    vuaKeo.current = false;
    keo.current = {
      dx: event.clientX - rect.left,
      dy: event.clientY - rect.top,
      x0: event.clientX,
      y0: event.clientY,
      w: rect.width,
      h: rect.height,
      moved: false,
      last: null,
    };
    ref.current.setPointerCapture?.(event.pointerId);
  }

  function onPointerMove(event) {
    const d = keo.current;
    if (!d) return;
    if (
      !d.moved &&
      Math.abs(event.clientX - d.x0) < NGUONG_KEO &&
      Math.abs(event.clientY - d.y0) < NGUONG_KEO
    ) {
      return;
    }
    if (!d.moved) {
      d.moved = true;
      setDragging(true);
    }
    d.last = {
      left: clamp(event.clientX - d.dx, LE, window.innerWidth - d.w - LE),
      top: clamp(event.clientY - d.dy, LE, window.innerHeight - d.h - LE),
    };
    setPos(d.last);
  }

  function onPointerUp(event) {
    const d = keo.current;
    keo.current = null;
    if (!d) return;
    ref.current?.releasePointerCapture?.(event.pointerId);
    if (!d.moved) return;
    setDragging(false);
    // Chặn cú click sinh ra ngay sau khi thả, nếu không kéo xong là chat bật lên.
    vuaKeo.current = true;
    if (d.last) luuViTri(d.last);
  }

  // Không reset cờ ở đây: kéo xa quá thì trình duyệt không bắn click, cờ sẽ
  // treo lại và nuốt mất cú bấm sau. Reset ở onPointerDown mới chắc.
  function onClick() {
    if (vuaKeo.current) return;
    onToggle();
  }

  return (
    <button
      ref={ref}
      className={"fab" + (dragging ? " dragging" : "")}
      style={pos ? { left: pos.left, top: pos.top, right: "auto", bottom: "auto" } : undefined}
      aria-label={label}
      title={label}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      onClick={onClick}
    >
      <Icon n="i-msg" size={26} />
    </button>
  );
}
