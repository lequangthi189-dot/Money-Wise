import { useEffect, useState } from "react";
import { addGoalContribution, createGoal, fetchGoalContributions, fetchGoals, fetchInterestSchedule, forecastGoal, updateGoal } from "../../models/goalsData";

const EMPTY = { name: "", target: "", rate: "", unit: "NAM", monthly: "", initial: "" };
const EMPTY_CONTRIBUTION = () => ({ amount: "", date: new Date().toISOString().slice(0, 10), note: "" });
const money = (value) => `${Number(value || 0).toLocaleString("vi-VN")} ₫`;

export default function Goals({ t, userId, onDataChanged }) {
  const g = t.goals;
  const [goals, setGoals] = useState([]);
  const [form, setForm] = useState(EMPTY);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [schedule, setSchedule] = useState([]);
  const [contributions, setContributions] = useState([]);
  const [contribution, setContribution] = useState(EMPTY_CONTRIBUTION);

  useEffect(() => {
    fetchGoals().then(setGoals).catch((e) => setError(e.message));
  }, []);

  const change = (field) => (event) => setForm((old) => ({ ...old, [field]: event.target.value }));

  async function submit() {
    if (!form.name.trim() || Number(form.target) <= 0) {
      setError(g.invalidGoal);
      return;
    }
    setSaving(true);
    setError("");
    try {
      const goal = editingId ? await updateGoal(editingId, form) : await createGoal(userId, form);
      setGoals((old) => editingId ? old.map((item) => item.ma_muc_tieu === editingId ? goal : item) : [goal, ...old]);
      setForm(EMPTY);
      setEditingId(null);
      await onDataChanged?.();
    } catch (e) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  }

  function edit(goal) {
    setEditingId(goal.ma_muc_tieu);
    setForm({ name: goal.ten_muc_tieu, target: goal.so_tien_muc_tieu, rate: goal.lai_suat, unit: goal.don_vi_lai_suat, monthly: goal.gop_du_kien_moi_ky, initial: goal.so_du_ban_dau });
    Promise.all([
      fetchInterestSchedule(goal.ma_muc_tieu),
      fetchGoalContributions(goal.ma_muc_tieu),
    ]).then(([interestRows, contributionRows]) => {
      setSchedule(interestRows);
      setContributions(contributionRows);
    }).catch((e) => setError(e.message));
  }

  async function addContribution() {
    if (!editingId || Number(contribution.amount) <= 0 || !contribution.date) {
      setError(g.invalidContribution);
      return;
    }
    setSaving(true);
    setError("");
    try {
      const updatedGoal = await addGoalContribution(editingId, contribution);
      const [interestRows, contributionRows] = await Promise.all([
        fetchInterestSchedule(editingId),
        fetchGoalContributions(editingId),
      ]);
      setGoals((old) => old.map((item) => item.ma_muc_tieu === editingId ? updatedGoal : item));
      setSchedule(interestRows);
      setContributions(contributionRows);
      setContribution(EMPTY_CONTRIBUTION());
      await onDataChanged?.();
    } catch (e) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  }

  return <>
    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 18 }}>
      <div><h2 style={{ fontSize: "1.05rem" }}>{g.heading}</h2><p className="muted">{g.sub}</p></div>
    </div>
    {error && <p style={{ color: "var(--danger)", marginBottom: 12 }}>{error}</p>}
    <div className="grid g-3">
      {goals.map((goal) => {
        const prediction = forecastGoal(goal);
        const pct = Math.min(100, Number(goal.phan_tram_tien_do || 0));
        const date = prediction.date ? prediction.date.toLocaleDateString("vi-VN", { month: "2-digit", year: "numeric" }) : "—";
        return <div className="goalcard glass" key={goal.ma_muc_tieu}>
          <div className="gh"><div className="ico c-shop">🎯</div><div><b>{goal.ten_muc_tieu}</b><small>{g.target(money(goal.so_tien_muc_tieu))}</small></div></div>
          <div className="track" style={{ height: 11 }}><div className="bar" style={{ width: `${pct}%` }} /></div>
          <div className="nums"><span>{g.saved} <b>{money(goal.tong_so_du_thuc_te)}</b></span><span><b>{pct}%</b></span></div>
          <div className="forecast">{g.forecast(`${goal.lai_suat}${goal.don_vi_lai_suat === "NAM" ? g.perYear : g.perMonth}`, date)}</div>
          <button className="btn" style={{ marginTop: 10 }} onClick={() => edit(goal)}>{g.viewUpdate}</button>
        </div>;
      })}
    </div>
    <div className="card glass" style={{ marginTop: 18 }}>
      <div className="card-h"><h3>{g.newTitle}</h3></div>
      <div className="grid g-3" style={{ gap: 14 }}>
        <div className="field"><label>{g.gName}</label><input value={form.name} onChange={change("name")} /></div>
        <div className="field"><label>{g.gAmount}</label><input type="number" min="1" value={form.target} onChange={change("target")} /></div>
        <div className="field"><label>{g.rate}</label><div style={{ display: "flex", gap: 8 }}><input type="number" min="0" value={form.rate} onChange={change("rate")} /><select value={form.unit} onChange={change("unit")}><option value="NAM">{g.perYear}</option><option value="THANG">{g.perMonth}</option></select></div></div>
        <div className="field"><label>{g.monthlyAdd}</label><input type="number" min="0" value={form.monthly} onChange={change("monthly")} /></div>
        <div className="field"><label>{g.initBalance}</label><input type="number" min="0" value={form.initial} onChange={change("initial")} disabled={Boolean(editingId)} /></div>
        <div className="field" style={{ display: "flex", alignItems: "flex-end" }}><button className="btn btn-primary" style={{ width: "100%" }} disabled={saving} onClick={submit}>{editingId ? g.updateForecast : g.createForecast}</button></div>
      </div>
    </div>
    {editingId && <>
      <div className="card glass" style={{ marginTop: 18 }}>
        <div className="card-h"><h3>{g.addContributionTitle}</h3></div>
        <div className="grid g-3" style={{ gap: 14 }}>
          <div className="field"><label>{g.amount}</label><input type="number" min="1" value={contribution.amount} onChange={(e) => setContribution((old) => ({ ...old, amount: e.target.value }))} /></div>
          <div className="field"><label>{g.contributionDate}</label><input type="date" max={new Date().toISOString().slice(0, 10)} value={contribution.date} onChange={(e) => setContribution((old) => ({ ...old, date: e.target.value }))} /></div>
          <div className="field"><label>{g.note}</label><input maxLength={255} value={contribution.note} onChange={(e) => setContribution((old) => ({ ...old, note: e.target.value }))} /></div>
        </div>
        <button className="btn btn-primary" style={{ marginTop: 14 }} disabled={saving} onClick={addContribution}>{saving ? g.saving : g.addContribution}</button>
      </div>

      <div className="card glass" style={{ marginTop: 18, overflowX: "auto" }}>
        <div className="card-h"><h3>{g.contributionHistory}</h3></div>
        {contributions.length ? <table style={{ width: "100%", borderCollapse: "collapse" }}><thead><tr><th>{g.contributionDate}</th><th>{g.amount}</th><th>{g.note}</th></tr></thead><tbody>{contributions.map((row) => <tr key={row.ma_dong_gop}><td>{new Date(`${row.ngay_dong_gop}T00:00:00`).toLocaleDateString()}</td><td>{money(row.so_tien)}</td><td>{row.ghi_chu || "—"}</td></tr>)}</tbody></table> : <p className="muted">{g.noContributions}</p>}
      </div>

      <div className="card glass" style={{ marginTop: 18, overflowX: "auto" }}><div className="card-h"><h3>{g.interestSchedule}</h3></div><table style={{ width: "100%", borderCollapse: "collapse" }}><thead><tr><th>{g.period}</th><th>{g.openingBalance}</th><th>{g.duringPeriod}</th><th>{g.interestEarned}</th><th>{g.accumulatedInterest}</th><th>{g.endingTotal}</th></tr></thead><tbody>{schedule.map((row) => <tr key={row.so_thu_tu_ky}><td>{row.so_thu_tu_ky}</td><td>{money(row.so_du_dau_ky)}</td><td>{money(row.so_tien_trong_ky)}</td><td>{money(row.lai_phat_sinh)}</td><td>{money(row.lai_tich_luy)}</td><td>{money(row.tong_cuoi_ky)}</td></tr>)}</tbody></table></div>
    </>}
  </>;
}
