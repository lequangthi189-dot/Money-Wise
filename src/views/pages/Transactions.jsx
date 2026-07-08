import { useTransactions } from "../../controllers/useTransactions";

export default function Transactions({ query = "", t }) {
  const tr = t.transactions;
  const { filtered } = useTransactions(query, t);
  const q = query.trim();

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
              <button className="on out">{tr.expense}</button>
              <button>{tr.income}</button>
            </div>
          </div>
          <div className="field">
            <label>{tr.amount}</label>
            <input defaultValue="35.000" placeholder="0 ₫" />
          </div>
          <div className="field">
            <label>{tr.category}</label>
            <select>
              <option>☕ {t.cats.coffee}</option>
              <option>🍜 {t.cats.food}</option>
              <option>🛵 {t.cats.move}</option>
              <option>🎮 {t.cats.fun}</option>
            </select>
          </div>
          <div className="grid g-2" style={{ gap: "12px" }}>
            <div className="field">
              <label>{tr.date}</label>
              <input type="date" defaultValue="2026-06-25" />
            </div>
            <div className="field">
              <label>{tr.method}</label>
              <select>
                <option>{t.methods.ewallet}</option>
                <option>{t.methods.cash}</option>
                <option>{t.methods.card}</option>
              </select>
            </div>
          </div>
          <div className="field">
            <label>{tr.note}</label>
            <textarea
              placeholder={tr.notePh}
              defaultValue="Trà sữa Phúc Long"
            ></textarea>
          </div>
          <div className="btn-row">
            <button className="btn btn-primary" style={{ flex: "1" }}>
              {tr.save}
            </button>
            <button className="btn">{tr.cancel}</button>
          </div>
          <div className="hr"></div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "9px",
              fontSize: ".78rem",
              color: "var(--text-dim)",
              cursor: "pointer",
            }}
          >
            <svg width="18" height="18" style={{ color: "var(--accent)" }}>
              <use href="#i-msg" />
            </svg>
            {tr.quickChat}
          </div>
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
              <span
                className={"badge " + (tx.type === "in" ? "b-in" : "b-out")}
              >
                {tx.type === "in" ? t.thu : t.chi}
              </span>
              <div
                className={"amt " + tx.type}
                style={{ minWidth: "90px", textAlign: "right" }}
              >
                {tx.amount}
              </div>
              <div className="act">
                <button>
                  <svg width="15" height="15">
                    <use href="#i-edit" />
                  </svg>
                </button>
                <button>
                  <svg width="15" height="15">
                    <use href="#i-trash" />
                  </svg>
                </button>
              </div>
            </div>
          ))}

          {filtered.length === 0 && (
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
