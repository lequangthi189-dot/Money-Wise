import { useState, useRef } from "react";
import { Icon } from "../components/icons";

// Màu HOÀN TOÀN lấy từ biến theme (--surface, --text, --accent...), không hardcode.

const AVA = 88; // đường kính avatar
const RING = 5; // độ dày vòng tiến trình
const BOX = AVA + RING * 2 + 8; // vùng chứa cả vòng

const DEMO_PW = "123456"; // TODO: bỏ khi nối Supabase

/* ============ Hàng thông tin ============ */
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

/* ============ Vòng tiến trình quanh avatar ============ */
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

/* ============ Ô nhập mật khẩu (có nút hiện/ẩn) ============ */
function PwField({ label, value, onChange, err, ph, t }) {
  const [show, setShow] = useState(false);
  return (
    <div className="field">
      <label>{label}</label>
      <div style={{ position: "relative" }}>
        <input
          type={show ? "text" : "password"}
          value={value}
          placeholder={ph}
          onChange={(e) => onChange(e.target.value)}
          style={{
            width: "100%",
            paddingRight: "44px",
            borderColor: err ? "var(--danger)" : undefined,
          }}
        />
        <button
          type="button"
          onClick={() => setShow((v) => !v)}
          aria-label={show ? t.hide : t.show}
          title={show ? t.hide : t.show}
          style={{
            position: "absolute",
            right: "8px",
            top: "50%",
            transform: "translateY(-50%)",
            width: "30px",
            height: "30px",
            border: "none",
            background: "transparent",
            color: "var(--text-dim)",
            cursor: "pointer",
            display: "grid",
            placeItems: "center",
            fontSize: ".9rem",
          }}
        >
          {show ? "🙈" : "👁"}
        </button>
      </div>
      {err && (
        <small
          style={{
            display: "block",
            marginTop: "5px",
            fontSize: ".74rem",
            color: "var(--danger)",
          }}
        >
          {err}
        </small>
      )}
    </div>
  );
}

/* ============ Popup đổi mật khẩu ============ */
function strengthOf(v) {
  let sc = 0;
  if (v.length >= 8) sc++;
  if (/[a-zA-Z]/.test(v) && /\d/.test(v)) sc++;
  if (v.length >= 12 || /[^a-zA-Z0-9]/.test(v)) sc++;
  return Math.min(sc, 3);
}

function ChangePassword({ t, onClose }) {
  const p = t.pw;
  const [cur, setCur] = useState("");
  const [next, setNext] = useState("");
  const [conf, setConf] = useState("");
  const [errs, setErrs] = useState({});
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  const sc = strengthOf(next);
  const barColor = ["var(--danger)", "var(--warn)", "var(--ok)"][
    Math.max(sc - 1, 0)
  ];

  function validate() {
    const e = {};
    if (!cur) e.cur = p.eCurrent;
    else if (cur !== DEMO_PW) e.cur = p.eWrong;

    if (next.length < 8) e.next = p.eShort;
    else if (!(/[a-zA-Z]/.test(next) && /\d/.test(next))) e.next = p.eWeak;
    else if (next === cur) e.next = p.eSame;

    if (conf !== next) e.conf = p.eConfirm;

    setErrs(e);
    return Object.keys(e).length === 0;
  }

  function submit() {
    if (!validate()) return;
    setBusy(true);
    // TODO: await supabase.auth.updateUser({ password: next })
    setTimeout(() => {
      setBusy(false);
      setDone(true);
      setTimeout(onClose, 1200);
    }, 700);
  }

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 120,
        background: "rgba(0,0,0,0.55)",
        backdropFilter: "blur(3px)",
        WebkitBackdropFilter: "blur(3px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="card glass"
        style={{
          width: "min(94vw, 420px)",
          padding: "24px 22px",
          animation: "fade .2s ease",
        }}
      >
        {done ? (
          <div style={{ textAlign: "center", padding: "20px 0" }}>
            <div
              style={{
                width: "54px",
                height: "54px",
                borderRadius: "50%",
                background: "color-mix(in srgb, var(--ok) 18%, transparent)",
                color: "var(--ok)",
                display: "grid",
                placeItems: "center",
                margin: "0 auto 14px",
                fontSize: "1.5rem",
              }}
            >
              ✓
            </div>
            <b style={{ fontSize: "1rem" }}>{p.ok}</b>
          </div>
        ) : (
          <>
            <div style={{ marginBottom: "18px" }}>
              <h3 style={{ fontSize: "1.1rem", fontWeight: 700 }}>{p.title}</h3>
              <p
                style={{
                  fontSize: ".8rem",
                  color: "var(--text-dim)",
                  marginTop: "3px",
                }}
              >
                {p.sub}
              </p>
            </div>

            <PwField
              label={p.current}
              value={cur}
              onChange={setCur}
              err={errs.cur}
              ph={p.ph}
              t={p}
            />

            <PwField
              label={p.next}
              value={next}
              onChange={setNext}
              err={errs.next}
              ph={p.ph}
              t={p}
            />

            {next && !errs.next && (
              <div style={{ margin: "-6px 0 14px" }}>
                <div style={{ display: "flex", gap: "5px", marginBottom: "5px" }}>
                  {[0, 1, 2].map((i) => (
                    <div
                      key={i}
                      style={{
                        flex: 1,
                        height: "4px",
                        borderRadius: "3px",
                        background: i < sc ? barColor : "var(--track)",
                        transition: "background .2s",
                      }}
                    />
                  ))}
                </div>
                <small style={{ fontSize: ".72rem", color: "var(--text-dim)" }}>
                  {sc > 0 ? p.strength[sc - 1] : p.rules}
                </small>
              </div>
            )}

            <PwField
              label={p.confirm}
              value={conf}
              onChange={setConf}
              err={errs.conf}
              ph={p.ph}
              t={p}
            />

            <small
              style={{
                display: "block",
                fontSize: ".72rem",
                color: "var(--text-faint)",
                margin: "-4px 0 16px",
              }}
            >
              {p.rules}
            </small>

            <div style={{ display: "flex", gap: "10px" }}>
              <button
                className="btn"
                style={{ flex: 1 }}
                onClick={onClose}
                disabled={busy}
              >
                {p.cancel}
              </button>
              <button
                className="btn btn-primary"
                style={{ flex: 1, opacity: busy ? 0.6 : 1 }}
                onClick={submit}
                disabled={busy}
              >
                {busy ? p.saving : p.submit}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

/* ============ Trang Hồ sơ ============ */
export default function Profile({ t, onLogout, fontSize, setFontSize }) {
  const p = t.profile;
  const fileRef = useRef(null);
  const [avatar, setAvatar] = useState(null);
  const [progress, setProgress] = useState(null); // null = không upload
  const [showPw, setShowPw] = useState(false);

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
        setTimeout(() => setProgress(null), 600);
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
        <button
          className="btn"
          style={{ flex: 1 }}
          onClick={() => setShowPw(true)}
        >
          {p.changePw}
        </button>
      </div>

      {showPw && <ChangePassword t={t} onClose={() => setShowPw(false)} />}
    </div>
  );
}