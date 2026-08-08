import { useEffect, useState } from "react";
import { createShareCode, fetchMonthlyReports, fetchReportDetails, fetchSharedReport, PIE_COLORS } from "../../models/reportsData";

const money = (value) => `${Number(value || 0).toLocaleString("vi-VN")} ₫`;

export function SharedReportView({ code, t, onClose }) {
  const r = t.reports;
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let alive = true;
    fetchSharedReport(code).then(
      (row) => {
        if (!alive) return;
        if (!row) setError("Mã chia sẻ không hợp lệ hoặc đã được thu hồi.");
        else setReport(row);
        setLoading(false);
      },
      (e) => {
        if (!alive) return;
        setError(e.message);
        setLoading(false);
      },
    );
    return () => { alive = false; };
  }, [code]);

  return (
    <div className="root" data-theme="glass" style={{ minHeight: "100vh", padding: 24 }}>
      <main style={{ width: "min(920px, 100%)", margin: "0 auto" }}>
        <div className="card glass" style={{ marginBottom: 18 }}>
          <div className="card-h">
            <div>
              <h3>MoneyWise · Báo cáo được chia sẻ</h3>
              <span className="muted">Mã: {code}</span>
            </div>
            <button className="btn" onClick={onClose}>Quay lại ứng dụng</button>
          </div>
        </div>

        {loading && <div className="card glass">{t.loadingSession}</div>}
        {error && <div className="card glass" style={{ color: "var(--danger)" }}>{error}</div>}

        {report && (
          <>
            <div className="card glass" style={{ marginBottom: 18 }}>
              <h3>
                Báo cáo tháng {new Date(report.ky_thang).toLocaleDateString("vi-VN", {
                  month: "2-digit",
                  year: "numeric",
                })}
              </h3>
            </div>
            <div className="grid g-3">
              <div className="stat glass"><label>{r.totalIn}</label><div className="val sm" style={{ color: "var(--ok)" }}>{money(report.tong_thu)}</div></div>
              <div className="stat glass"><label>{r.totalOut}</label><div className="val sm" style={{ color: "var(--danger)" }}>{money(report.tong_chi)}</div></div>
              <div className="stat glass"><label>{r.endBalance}</label><div className="val sm">{money(report.so_du)}</div></div>
            </div>
            <div className="card glass" style={{ marginTop: 18 }}>
              <div className="card-h"><h3>{r.structure}</h3></div>
              {(report.chi_tiet ?? []).map((row, i) => (
                <div key={`${row.ten_danh_muc}-${i}`} style={{ display: "flex", gap: 12, margin: "10px 0" }}>
                  <span style={{ width: 10, height: 10, borderRadius: 9, background: PIE_COLORS[i % PIE_COLORS.length] }} />
                  <span style={{ flex: 1 }}>{row.ten_danh_muc}</span>
                  <b>{money(row.tong_chi_danh_muc)}</b>
                  <span>{row.ty_le_phan_tram}%</span>
                </div>
              ))}
            </div>
          </>
        )}
      </main>
    </div>
  );
}

export default function Reports({ t, userId }) {
  const r = t.reports;
  const [reports, setReports] = useState([]);
  const [selectedId, setSelectedId] = useState("");
  const [details, setDetails] = useState([]);
  const [shareCode, setShareCode] = useState("");
  const [lookup, setLookup] = useState("");
  const [shared, setShared] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => { if (userId) fetchMonthlyReports(userId).then((rows) => { setReports(rows); setSelectedId(String(rows[0]?.ma_bao_cao ?? "")); }).catch((e) => setError(e.message)); }, [userId]);
  useEffect(() => { fetchReportDetails(selectedId).then(setDetails).catch((e) => setError(e.message)); }, [selectedId]);
  const selected = shared ?? reports.find((row) => String(row.ma_bao_cao) === selectedId) ?? {};

  async function share() {
    if (!selectedId) return;
    try {
      const code = await createShareCode(Number(selectedId));
      setShareCode(code);
    } catch (e) { setError(e.message); }
  }
  async function openCode() {
    try { const row = await fetchSharedReport(lookup); if (!row) throw new Error("Mã chia sẻ không hợp lệ."); setShared(row); } catch (e) { setError(e.message); }
  }

  return <>
    <div style={{ display: "flex", gap: 12, marginBottom: 18 }}>
      <select value={selectedId} onChange={(e) => { setSelectedId(e.target.value); setShared(null); }}>{reports.map((row) => <option key={row.ma_bao_cao} value={row.ma_bao_cao}>{new Date(row.ky_thang).toLocaleDateString("vi-VN", { month: "2-digit", year: "numeric" })}</option>)}</select>
      <button className="btn" onClick={share}>{r.makeShare}</button>
    </div>
    {error && <p style={{ color: "var(--danger)", marginBottom: 12 }}>{error}</p>}
    <div className="grid g-3"><div className="stat glass"><label>{r.totalIn}</label><div className="val sm" style={{ color: "var(--ok)" }}>{money(selected.tong_thu)}</div></div><div className="stat glass"><label>{r.totalOut}</label><div className="val sm" style={{ color: "var(--danger)" }}>{money(selected.tong_chi)}</div></div><div className="stat glass"><label>{r.endBalance}</label><div className="val sm">{money(selected.so_du)}</div></div></div>
    {!shared && <div className="card glass" style={{ marginTop: 18 }}><div className="card-h"><h3>{r.structure}</h3></div>{details.map((row, i) => <div key={i} style={{ display: "flex", gap: 12, margin: "10px 0" }}><span style={{ width: 10, height: 10, borderRadius: 9, background: PIE_COLORS[i % PIE_COLORS.length] }} /><span style={{ flex: 1 }}>{row.danh_muc?.ten_danh_muc}</span><b>{money(row.tong_chi_danh_muc)}</b><span>{row.ty_le_phan_tram}%</span></div>)}</div>}
    <div className="card glass" style={{ marginTop: 18 }}><div className="card-h"><h3>{r.shareTitle}</h3></div>{shareCode && <div className="sharebox"><code>{shareCode}</code><button className="btn" onClick={() => navigator.clipboard.writeText(`${window.location.origin}${window.location.pathname}#/share/${encodeURIComponent(shareCode)}`)}>Copy link</button></div>}<div style={{ display: "flex", gap: 8, marginTop: 12 }}><input value={lookup} onChange={(e) => setLookup(e.target.value)} placeholder="MW-XXXX-XXXX" /><button className="btn" onClick={openCode}>Xem mã</button></div></div>
  </>;
}
