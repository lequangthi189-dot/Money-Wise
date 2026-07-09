import { useState, useRef } from "react";
import { Icon } from "../components/icons";

// Màu HOÀN TOÀN lấy từ biến theme (--surface, --text, --accent...), không hardcode.

const AVA = 88; // đường kính avatar
const RING = 5; // độ dày vòng tiến trình
const BOX = AVA + RING * 2 + 8; // vùng chứa cả vòng

function Row({ label, value, onEdit, editable = true, t }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "12px",
        padding: "10px 0",
        borderBottom: "1px solid var(--border)",
      }}
    >
      <span
        style={{
          width: "120px",
          flex: "0 0 auto",
          fontSize: ".8rem",
          color: "var(--text-dim)",
        }}
      >
        {label}
      </span>
      <b
        style={{
          flex: 1,
          fontSize: ".9rem",
          fontWeight: 600,
          overflowWrap: "anywhere",
        }}
      >
        {value}
      </b>
      {editable && (
        <button
          onClick={onEdit}
          aria-label={t.edit}
          title={t.edit}
          style={{
            width: "28px",
            height: "28px",
            flex: "0 0 auto",
            borderRadius: "8px",
            border: "1px solid var(--border)",
            background: "transparent",
            color: "var(--text-dim)",
            cursor: "pointer",
            display: "grid",
            placeItems: "center",
          }}
        >
          <svg width="13" height="13">
            <use href="#i-edit" />
          </svg>
        </button>
      )}
    </div>
  );
}

// Vòng tiến trình bao quanh avatar
function ProgressRing({ percent }) {
  const r = (BOX - RING) / 2;
  const c = 2 * Math.PI * r;
  return (
    <svg
      width={BOX}
      height={BOX}
      style={{
        position: "absolute",
        inset: 0,
        transform: "rotate(-90deg)",
        pointerEvents: "none",
      }}
    >
      <circle
        cx={BOX / 2}
        cy={BOX / 2}
        r={r}
        fill="none"
        stroke="var(--track)"
        strokeWidth={RING}
      />
      <circle
        cx={BOX / 2}
        cy={BOX / 2}
        r={r}
        fill="none"
        stroke="var(--accent)"
        strokeWidth={RING}
        strokeLinecap="round"
        strokeDasharray={c}
        strokeDashoffset={c * (1 - percent / 100)}
        style={{ transition: "stroke-dashoffset .2s linear" }}
      />
    </svg>
  );
}

export default function Profile({ t, onLogout, fontSize, setFontSize }) {
  const p = t.profile;
  const fileRef = useRef(null);
  const [avatar, setAvatar] = useState(null);
  const [progress, setProgress] = useState(null); // null = không upload

  function pickFile(e) {
    const f = e.target.files?.[0];
    if (!f) return;
    if (f.size > 5 * 1024 * 1024) return; // >5MB thì bỏ qua

    const url = URL.createObjectURL(f);
    setProgress(0);

    // Giả lập tiến trình upload. Khi nối Supabase Storage thì thay bằng
    // tiến trình thật (XHR upload.onprogress hoặc TUS resumable upload).
    let pct = 0;
    const timer = setInterval(() => {
      pct += Math.random() * 18 + 7;
      if (pct >= 100) {
        clearInterval(timer);
        setProgress(100);
        setAvatar(url);
        setTimeout(() => setProgress(null), 600); // xong thì ẩn vòng
      } else {
        setProgress(Math.round(pct));
      }
    }, 180);
    // TODO: supabase.storage.from("avatars").upload(path, f)
  }

  const uploading = progress !== null;

  return (
    <div className="card glass" style={{ padding: "22px 20px" }}>
      {/* ---- Avatar + vòng tiến trình + chuỗi ghi chép (nằm cạnh nhau) ---- */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "18px",
          marginBottom: "18px",
        }}
      >
        <div style={{ textAlign: "center", flex: "0 0 auto" }}>
        <div
          style={{
            position: "relative",
            width: BOX,
            height: BOX,
            margin: "0 auto 10px",
          }}
        >
          {uploading && <ProgressRing percent={progress} />}

          <div
            className="ava"
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: AVA,
              height: AVA,
              fontSize: "1.7rem",
              overflow: "hidden",
              opacity: uploading ? 0.75 : 1,
              transition: "opacity .2s",
            }}
          >
            {avatar ? (
              <img
                src={avatar}
                alt=""
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            ) : (
              "TH"
            )}
          </div>

          {uploading && (
            <div
              style={{
                position: "absolute",
                bottom: "-6px",
                left: "50%",
                transform: "translateX(-50%)",
                padding: "3px 12px",
                borderRadius: "999px",
                background: "var(--surface)",
                border: "1px solid var(--border)",
                fontSize: ".78rem",
                fontWeight: 700,
                color: "var(--accent)",
              }}
            >
              {progress}%
            </div>
          )}
        </div>

        <input
          ref={fileRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={pickFile}
          style={{ display: "none" }}
        />
        <button
          className="btn btn-primary"
          style={{ padding: "9px 20px", opacity: uploading ? 0.6 : 1 }}
          disabled={uploading}
          onClick={() => fileRef.current?.click()}
        >
          {p.pickPhoto}
        </button>
        <p
          style={{
            fontSize: ".7rem",
            color: "var(--text-dim)",
            marginTop: "6px",
            maxWidth: "150px",
          }}
        >
          {p.photoHint}
        </p>
        </div>

        {/* ---- Chuỗi ghi chép (kế avatar) ---- */}
        <div
          style={{
            flex: 1,
            padding: "14px 16px",
            borderRadius: "var(--r-md)",
            background: "var(--surface-2)",
            border: "1px solid var(--border)",
          }}
        >
          <div
            style={{
              fontSize: ".66rem",
              letterSpacing: ".12em",
              color: "var(--text-faint)",
              marginBottom: "10px",
            }}
          >
            {p.streakTitle}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "11px" }}>
            <span style={{ fontSize: "1.6rem" }}>🔥</span>
            <div>
              <b style={{ fontSize: "1rem" }}>{p.streakDays(12)}</b>
              <small
                style={{
                  display: "block",
                  fontSize: ".72rem",
                  color: "var(--text-dim)",
                }}
              >
                {p.record(18)}
              </small>
            </div>
          </div>
          <small
            style={{
              display: "block",
              fontSize: ".7rem",
              color: "var(--text-faint)",
              marginTop: "10px",
            }}
          >
            {p.joined("06/2026")}
          </small>
        </div>
      </div>

      {/* ---- Thông tin ---- */}
      <Row label={p.name} value="Thi Nguyễn" t={p} />
      <Row label={p.username} value="lequangthi" t={p} />
      <Row label={p.email} value="thi@huflit.edu.vn" editable={false} t={p} />
      <Row label={p.phone} value="+84 909 xxx xxx" t={p} />

      {/* ---- Giao diện: cỡ chữ (thanh kéo) ---- */}
      <div
        style={{
          marginTop: "16px",
          padding: "14px 16px",
          borderRadius: "var(--r-md)",
          background: "var(--surface-2)",
          border: "1px solid var(--border)",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "10px",
          }}
        >
          <span style={{ fontSize: ".85rem" }}>{p.fontSize}</span>
          <b style={{ fontSize: ".82rem", color: "var(--accent)" }}>
            {fontSize}px
          </b>
        </div>
        <input
          type="range"
          min="14"
          max="20"
          step="1"
          value={fontSize}
          onChange={(e) => setFontSize?.(+e.target.value)}
          style={{ width: "100%", accentColor: "var(--accent)" }}
        />
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            fontSize: ".7rem",
            color: "var(--text-faint)",
            marginTop: "4px",
          }}
        >
          <span>{p.small}</span>
          <span>{p.medium}</span>
          <span>{p.large}</span>
        </div>
      </div>

      {/* ---- Hành động ---- */}
      <div style={{ display: "flex", gap: "10px", marginTop: "18px" }}>
        <button
          className="btn"
          style={{
            flex: 1,
            color: "var(--danger)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "7px",
          }}
          onClick={onLogout}
        >
          <Icon n="i-logout" size={15} />
          {p.logout}
        </button>
        <button className="btn" style={{ flex: 1 }}>
          {p.changePw}
        </button>
      </div>
    </div>
  );
}