import { useRef } from "react";
import { useTransactions } from "../../controllers/useTransactions";

function TransactionSelect({ value, onChange, options, label }) {
  const menuRef = useRef(null);
  const selected = options.find((option) => String(option.value) === String(value)) ?? options[0];

  function select(nextValue) {
    onChange(String(nextValue));
    menuRef.current?.removeAttribute("open");
  }

  return (
    <details className="transaction-select" ref={menuRef}>
      <summary aria-label={label}>{selected?.label}</summary>
      <div className="transaction-select-menu" role="listbox" aria-label={label}>
        {options.map((option) => (
          <button key={option.value || "all"} type="button" role="option" aria-selected={String(option.value) === String(value)} className={String(option.value) === String(value) ? "selected" : ""} onClick={() => select(option.value)}>
            {option.label}
          </button>
        ))}
      </div>
    </details>
  );
}

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
    filterCategories,
    methods,
    filters,
    setFilter,
    resetFilters,
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
  const hasFilters = Object.values(filters).some(Boolean);
  const categoryOptions = [{ value: "", label: "—" }, ...cats.map((category) => ({ value: category.id, label: `${category.icon} ${category.name}` }))];
  const methodOptions = [{ value: "", label: "—" }, ...methods.map((method) => ({ value: method.id, label: t.methods[method.mkey] ?? method.name }))];

  return (
    <>
      <div className="transactions-layout">
        <div className="card glass transaction-form-card">
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
            <TransactionSelect value={form.categoryId} onChange={(value) => upd("categoryId")({ target: { value } })} options={categoryOptions} label={tr.category} />
          </div>
          <div className="grid g-2" style={{ gap: "12px" }}>
            <div className="field">
              <label>{tr.date}</label>
              <input type="date" value={form.date} onChange={upd("date")} />
            </div>
            <div className="field">
              <label>{tr.method}</label>
              <TransactionSelect value={form.methodId} onChange={(value) => upd("methodId")({ target: { value } })} options={methodOptions} label={tr.method} />
            </div>
          </div>
          <div className="field">
            <label>{tr.note}</label>
            <textarea
              placeholder={tr.notePh}
              value={form.note}
              onChange={upd("note")}
              maxLength={255}
            ></textarea>
            <small className="field-counter">{form.note.length}/255</small>
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

        <div className="card glass transaction-list-card">
          <div className="card-h transaction-list-head">
            <h3>{tr.list}</h3>
            <div className="transaction-period-pills" aria-label={tr.filterTime}>
              {[
                ["month", tr.fMonth],
                ["week", tr.fWeek],
                ["day", tr.fDay],
              ].map(([value, label]) => (
                <button key={value} type="button" className={filters.period === value ? "active" : ""} onClick={() => setFilter("period", filters.period === value ? "" : value)}>
                  {label}
                </button>
              ))}
              <div className="transaction-category-filter">
                <TransactionSelect value={filters.categoryId} onChange={(value) => setFilter("categoryId", value)} label={tr.category} options={[{ value: "", label: tr.allCategories }, ...filterCategories.map((category) => ({ value: category.id, label: `${category.icon} ${category.name}` }))]} />
              </div>
            </div>
          </div>

          {(q || hasFilters) && (
            <div className="transaction-filter-summary">
              <span>{tr.filteredCount(filtered.length)}</span>
              {hasFilters && <button type="button" onClick={resetFilters}>{tr.clearFilters}</button>}
            </div>
          )}

          {filtered.length > 0 && (
            <div className="transaction-list">
              {filtered.map((tx) => (
                <article className="transaction-item" key={tx.id}>
                  <span className={"cat " + tx.cls}>{tx.icon}</span>
                  <div className="transaction-item-main">
                    <strong>{tx.name}</strong>
                    <small>{tx.date} · {t.methods[tx.mkey]}</small>
                  </div>
                  <span className={"badge " + (tx.type === "in" ? "b-in" : "b-out")}>{tx.type === "in" ? t.thu : t.chi}</span>
                  <strong className={"amt " + tx.type}>{tx.amount}</strong>
                  <div className="transaction-actions">
                    <button type="button" onClick={() => edit(tx)} disabled={saving} title={tr.actions}><svg width="15" height="15"><use href="#i-edit" /></svg></button>
                    <button type="button" onClick={() => remove(tx)} disabled={saving} title={tr.actions}><svg width="15" height="15"><use href="#i-trash" /></svg></button>
                  </div>
                </article>
              ))}
            </div>
          )}

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
              {q || hasFilters ? tr.noFiltered : tr.noResult(query)}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
