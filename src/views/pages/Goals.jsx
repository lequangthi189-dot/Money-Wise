import { getGoalCards } from "../../models/goalsData";

export default function Goals({ t }) {
  const g = t.goals;
  const cards = getGoalCards(g);

  return (
    <>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "18px",
        }}
      >
        <div>
          <h2 style={{ fontSize: "1.05rem", fontWeight: "600" }}>
            {g.heading}
          </h2>
          <p style={{ fontSize: ".8rem", color: "var(--text-dim)" }}>{g.sub}</p>
        </div>
        <button className="btn btn-primary">
          <svg
            width="16"
            height="16"
            style={{ verticalAlign: "-3px", marginRight: "5px" }}
          >
            <use href="#i-plus" />
          </svg>
          {g.create}
        </button>
      </div>

      <div className="grid g-3">
        {cards.map((c, i) => {
          const rateStr = c.rate + (c.unit === "year" ? g.perYear : g.perMonth);
          return (
            <div className="goalcard glass" key={i}>
              <div className="gh">
                <div className={"ico " + c.cls}>{c.icon}</div>
                <div>
                  <b>{c.name}</b>
                  <small>{g.target(c.target)}</small>
                </div>
              </div>
              <div className="track" style={{ height: "11px" }}>
                <div
                  className={"bar " + c.bar}
                  style={{ width: c.pct + "%" }}
                ></div>
              </div>
              <div className="nums">
                <span>
                  {g.saved} <b>{c.saved}</b>
                </span>
                <span>
                  <b>{c.pct}%</b>
                </span>
              </div>
              <div className="forecast">
                <svg width="16" height="16">
                  <use href="#i-clock" />
                </svg>
                {g.forecast(rateStr, c.when)}
              </div>
            </div>
          );
        })}
      </div>

      <div className="card glass" style={{ marginTop: "18px" }}>
        <div className="card-h">
          <h3>{g.newTitle}</h3>
        </div>
        <div className="grid g-3" style={{ gap: "14px" }}>
          <div className="field">
            <label>{g.gName}</label>
            <input placeholder={g.gNamePh} />
          </div>
          <div className="field">
            <label>{g.gAmount}</label>
            <input placeholder="0 ₫" />
          </div>
          <div className="field">
            <label>{g.rate}</label>
            <div style={{ display: "flex", gap: "8px" }}>
              <input placeholder="5,5" style={{ flex: "1" }} />
              <select style={{ width: "auto" }}>
                <option>{g.perYear}</option>
                <option>{g.perMonth}</option>
              </select>
            </div>
          </div>
          <div className="field">
            <label>{g.monthlyAdd}</label>
            <input placeholder="0 ₫" />
          </div>
          <div className="field">
            <label>{g.initBalance}</label>
            <input placeholder="0 ₫" />
          </div>
          <div
            className="field"
            style={{ display: "flex", alignItems: "flex-end" }}
          >
            <button className="btn btn-primary" style={{ width: "100%" }}>
              {g.createForecast}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
