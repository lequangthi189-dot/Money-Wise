import { useEffect, useMemo, useState } from "react";
import { createShareCode, fetchMonthlyReports, fetchReportDetails, fetchSharedReport, PIE_COLORS } from "../../models/reportsData";

const localeFor = (lang) => lang === "en" ? "en-US" : "vi-VN";
const money = (value, locale) => `${Number(value || 0).toLocaleString(locale)} ₫`;

export function SharedReportView({ code, t, lang = "vi", theme = "glass", onClose }) {
  const r = t.reports;
  const locale = localeFor(lang);
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let alive = true;
    fetchSharedReport(code).then(
      (row) => {
        if (!alive) return;
        if (!row) setError(r.sharedInvalid);
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
  }, [code, r.sharedInvalid]);

  return (
    <div className="root" data-theme={theme} style={{ minHeight: "100vh", padding: 24 }}>
      <main style={{ width: "min(920px, 100%)", margin: "0 auto" }}>
        <div className="card glass" style={{ marginBottom: 18 }}>
          <div className="card-h">
            <div>
              <h3>{r.sharedTitle}</h3>
              <span className="muted">{r.codeLabel}: {code}</span>
            </div>
            <button className="btn" onClick={onClose}>{r.backToApp}</button>
          </div>
        </div>

        {loading && <div className="card glass">{t.loadingSession}</div>}
        {error && <div className="card glass" style={{ color: "var(--danger)" }}>{error}</div>}

        {report && (
          <>
            <div className="card glass" style={{ marginBottom: 18 }}>
              <h3>
                {r.monthReport(new Date(report.ky_thang).toLocaleDateString(locale, {
                  month: "2-digit",
                  year: "numeric",
                }))}
              </h3>
            </div>
            <div className="grid g-3">
              <div className="stat glass"><label>{r.totalIn}</label><div className="val sm" style={{ color: "var(--ok)" }}>{money(report.tong_thu, locale)}</div></div>
              <div className="stat glass"><label>{r.totalOut}</label><div className="val sm" style={{ color: "var(--danger)" }}>{money(report.tong_chi, locale)}</div></div>
              <div className="stat glass"><label>{r.endBalance}</label><div className="val sm">{money(report.so_du, locale)}</div></div>
            </div>
            <div className="card glass" style={{ marginTop: 18 }}>
              <div className="card-h"><h3>{r.structure}</h3></div>
              {(report.chi_tiet ?? []).map((row, i) => (
                <div key={`${row.ten_danh_muc}-${i}`} style={{ display: "flex", gap: 12, margin: "10px 0" }}>
                  <span style={{ width: 10, height: 10, borderRadius: 9, background: PIE_COLORS[i % PIE_COLORS.length] }} />
                  <span style={{ flex: 1 }}>{row.ten_danh_muc}</span>
                  <b>{money(row.tong_chi_danh_muc, locale)}</b>
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

export default function Reports({ t, userId, lang = "vi" }) {
  const r = t.reports;
  const locale = localeFor(lang);
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
  const visibleDetails = shared
    ? (shared.chi_tiet ?? []).map((row) => ({ ...row, danh_muc: { ten_danh_muc: row.ten_danh_muc } }))
    : details;
  const chartReports = useMemo(() => [...reports].reverse(), [reports]);
  const maxExpense = Math.max(...chartReports.map((row) => Number(row.tong_chi) || 0), 1);
  const totalDetails = visibleDetails.reduce((sum, row) => sum + Number(row.tong_chi_danh_muc || 0), 0);
  const donutBackground = visibleDetails.length && totalDetails > 0
    ? `conic-gradient(${visibleDetails.map((row, index) => {
      const before = visibleDetails.slice(0, index).reduce((sum, item) => sum + Number(item.tong_chi_danh_muc || 0), 0);
      const start = (before / totalDetails) * 100;
      const end = ((before + Number(row.tong_chi_danh_muc || 0)) / totalDetails) * 100;
      return `${PIE_COLORS[index % PIE_COLORS.length]} ${start}% ${end}%`;
    }).join(", ")})`
    : "var(--surface-2)";
  const trendPoints = chartReports.map((row, index) => {
    const x = chartReports.length === 1 ? 50 : (index / (chartReports.length - 1)) * 100;
    const y = 44 - ((Number(row.tong_chi) || 0) / maxExpense) * 34;
    return `${x},${y}`;
  }).join(" ");

  async function share() {
    if (!selectedId) return;
    try {
      const code = await createShareCode(Number(selectedId));
      setShareCode(code);
    } catch (e) { setError(e.message); }
  }
  async function openCode() {
    try { const row = await fetchSharedReport(lookup); if (!row) throw new Error(r.sharedInvalid); setShared(row); } catch (e) { setError(e.message); }
  }

  return <div className="reports-page">
    <div className="reports-toolbar">
      <select value={selectedId} onChange={(e) => { setSelectedId(e.target.value); setShared(null); }}>
        {reports.map((row) => <option key={row.ma_bao_cao} value={row.ma_bao_cao}>
          {new Date(row.ky_thang).toLocaleDateString(locale, { month: "long", year: "numeric" })}
        </option>)}
      </select>
      <button className="btn btn-primary" onClick={share}>▣ {r.makeShare}</button>
    </div>

    {error && <div className="reports-error">{error}</div>}

    <div className="reports-summary">
      <article className="report-stat glass report-income"><span>{r.totalIn}</span><b>{money(selected.tong_thu, locale)}</b><i>↗</i></article>
      <article className="report-stat glass report-expense"><span>{r.totalOut}</span><b>{money(selected.tong_chi, locale)}</b><i>↕</i></article>
      <article className="report-stat glass report-balance"><span>{r.endBalance}</span><b>{money(selected.so_du, locale)}</b><i>▣</i></article>
    </div>

    <div className="reports-charts-row">
      <section className="report-panel glass">
        <div className="report-panel-head"><h3>{r.structure}</h3><span>{r.pieChart}</span></div>
        <div className="report-donut-layout">
          <div className="report-donut" style={{ background: donutBackground }}>
            <div><b>{money(selected.tong_chi, locale)}</b><small>{r.totalOut.toLowerCase()}</small></div>
          </div>
          <div className="report-legend">
            {visibleDetails.length ? visibleDetails.map((row, index) => <div key={`${row.danh_muc?.ten_danh_muc}-${index}`}>
              <span style={{ background: PIE_COLORS[index % PIE_COLORS.length] }} />
              <label>{row.danh_muc?.ten_danh_muc || "—"}</label>
              <b>{Number(row.ty_le_phan_tram || 0).toLocaleString(locale)}%</b>
            </div>) : <p className="muted">{r.noExpense}</p>}
          </div>
        </div>
      </section>

      <section className="report-panel glass">
        <div className="report-panel-head"><h3>{r.compare6}</h3><span>{r.barChart}</span></div>
        <div className="report-bars">
          {chartReports.map((row) => <div className="report-bar-column" key={row.ma_bao_cao}>
            <div className="report-bar" style={{ height: `${Math.max(5, (Number(row.tong_chi || 0) / maxExpense) * 100)}%` }} />
            <small>{new Date(row.ky_thang).toLocaleDateString(locale, { month: "numeric" })}</small>
          </div>)}
        </div>
      </section>
    </div>

    <section className="report-panel report-trend glass">
      <div className="report-panel-head"><h3>{r.trend}</h3><span>{r.lineChart}</span></div>
      {chartReports.length ? <svg viewBox="0 0 100 50" preserveAspectRatio="none" aria-label={r.trend}>
        <defs><linearGradient id="reportTrendFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="var(--accent)" stopOpacity=".28"/><stop offset="1" stopColor="var(--accent)" stopOpacity="0"/></linearGradient></defs>
        <polygon points={`0,50 ${trendPoints} 100,50`} fill="url(#reportTrendFill)" />
        <polyline points={trendPoints} fill="none" stroke="var(--accent)" strokeWidth=".8" vectorEffect="non-scaling-stroke" />
      </svg> : <p className="muted">{r.noTrend}</p>}
    </section>

    <section className="report-panel report-share glass">
      <div className="report-panel-head"><div><h3>{r.shareTitle}</h3><p className="muted">{r.shareDesc}</p></div></div>
      {shareCode && <div className="sharebox"><code>{shareCode}</code><button className="btn" onClick={() => navigator.clipboard.writeText(`${window.location.origin}${window.location.pathname}#/share/${encodeURIComponent(shareCode)}`)}>{r.copy}</button></div>}
      <div className="report-code-lookup"><input value={lookup} onChange={(e) => setLookup(e.target.value)} placeholder={r.codePlaceholder} maxLength={20} /><button className="btn" onClick={openCode}>{r.viewCode}</button></div>
    </section>
  </div>;
}
