import { useTransactions } from "../../controllers/useTransactions";

export default function Transactions({
  query = "",
  t,
  userId,
  onDataChanged,
  onOpenChat,
}) {
  const tr = t.transactions;
  const q = query.trim().toLowerCase();
  const {
    filtered,
    cats,
    methods,
    loading,
    saving,
    error,
    form,
    upd,
    setType,
    isEditing,
    submit,
    edit,
    remove,
    resetForm,
  } = useTransactions(query, t, userId, onDataChanged);

  return (
    <>
      <div className="grid g-12">
        <div className="card glass">
          <div className="card-h">
            <h3>{tr.add}</h3>
          </div>
          <div className="field">
            <label>{tr.type}</label>
            <div className="seg">
              <button
                className={form.type === "out" ? "on out" : ""}
                onClick={() => setType("out")}
              >
                {tr.expense}
              </button>
              <button
                className={form.type === "in" ? "on" : ""}
                onClick={() => setType("in")}
              >
                {tr.income}
              </button>
            </div>
          </div>
          <div className="field">
            <label>{tr.amount}</label>
            <input
              value={form.amount}
              onChange={upd("amount")}
              placeholder="0 ₫"
              inputMode="numeric"
            />
          </div>
          <div className="field">
            <label>{tr.category}</label>
            <select value={form.categoryId} onChange={upd("categoryId")}>
              <option value="">—</option>
              {cats.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.icon} {c.name}
                </option>
              ))}
            </select>
          </div>
          <div className="grid g-2" style={{ gap: "12px" }}>
            <div className="field">
              <label>{tr.date}</label>
              <input type="date" value={form.date} onChange={upd("date")} />
            </div>
            <div className="field">
              <label>{tr.method}</label>
              <select value={form.methodId} onChange={upd("methodId")}>
                <option value="">—</option>
                {methods.map((m) => (
                  <option key={m.id} value={m.id}>
                    {t.methods[m.mkey] ?? m.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="field">
            <label>{tr.note}</label>
            <textarea
              placeholder={tr.notePh}
              value={form.note}
              onChange={upd("note")}
            ></textarea>
          </div>

          {error && (
            <div
              style={{
                fontSize: ".8rem",
                color: "var(--danger)",
                background: "rgba(248,113,113,.12)",
                border: "1px solid rgba(248,113,113,.3)",
                borderRadius: "10px",
                padding: "10px 12px",
                marginBottom: "12px",
              }}
            >
              {error}
            </div>
          )}

          <div className="btn-row">
            <button
              className="btn btn-primary"
              style={{ flex: "1" }}
              onClick={submit}
              disabled={saving}
            >
              {saving ? t.loadingSession : tr.save}
            </button>
            <button className="btn" onClick={resetForm} disabled={saving}>
              {tr.cancel}
            </button>
          </div>
          {isEditing && (
            <div
              className="muted"
              style={{ fontSize: ".76rem", marginTop: "8px" }}
            >
              Đang sửa giao dịch — bấm {tr.cancel} để thêm mới.
            </div>
          )}
          <div className="hr"></div>
          <button
            type="button"
            className="quick-chat-link"
            onClick={onOpenChat}
            aria-label={tr.quickChat}
          >
            <svg width="18" height="18" style={{ color: "var(--accent)" }}>
              <use href="#i-msg" />
            </svg>
            {tr.quickChat}
          </button>
        </div>

        <div className="card glass">
          <div className="card-h">
            <h3>{tr.list}</h3>
            <div style={{ display: "flex", gap: "7px" }}>
              <span className="pill on">{tr.fMonth}</span>
              <span className="pill">{tr.fWeek}</span>
              <span className="pill">{tr.fDay}</span>
              <span className="pill">{tr.fCat}</span>
            </div>
          </div>

          {q && (
            <div
              style={{
                fontSize: ".78rem",
                color: "var(--text-dim)",
                marginBottom: "10px",
              }}
            >
              {tr.result(query, filtered.length)}
            </div>
          )}

          {filtered.map((tx) => (
            <div className="tx" key={tx.id}>
              <div className={"cat " + tx.cls}>{tx.icon}</div>
              <div className="meta">
                <b>{tx.name}</b>
                <small>
                  {tx.date} · {t.methods[tx.mkey]}
                </small>
              </div>
              <span className={"badge " + (tx.type === "in" ? "b-in" : "b-out")}>
                {tx.type === "in" ? t.thu : t.chi}
              </span>
              <div
                className={"amt " + tx.type}
                style={{ minWidth: "90px", textAlign: "right" }}
              >
                {tx.amount}
              </div>
              <div className="act">
                <button onClick={() => edit(tx)} disabled={saving}>
                  <svg width="15" height="15">
                    <use href="#i-edit" />
                  </svg>
                </button>
                <button onClick={() => remove(tx.id)} disabled={saving}>
                  <svg width="15" height="15">
                    <use href="#i-trash" />
                  </svg>
                </button>
              </div>
            </div>
          ))}

          {loading && (
            <div
              style={{
                padding: "26px 10px",
                textAlign: "center",
                color: "var(--text-dim)",
                fontSize: ".85rem",
              }}
            >
              {t.loadingSession}
            </div>
          )}

          {!loading && filtered.length === 0 && (
            <div
              style={{
                padding: "26px 10px",
                textAlign: "center",
                color: "var(--text-dim)",
                fontSize: ".85rem",
              }}
            >
              {tr.noResult(query)}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
