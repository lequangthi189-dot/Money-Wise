import {
  BARS,
  PIE_RING,
  PIE_COLORS,
  PIE_OFF,
  getPie,
} from "../../models/reportsData";

export default function Reports({ t }) {
  const r = t.reports;
  const pie = getPie(t);
  const pieRing = PIE_RING;
  const pieColors = PIE_COLORS;
  const pieOff = PIE_OFF;

  return (
    <>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "12px",
          marginBottom: "18px",
        }}
      >
        <select style={{ width: "auto" }}>
          {r.monthOpts.map((m, i) => (
            <option key={i}>{m}</option>
          ))}
        </select>
        <div style={{ flex: "1" }}></div>
        <button className="btn">
          <svg
            width="16"
            height="16"
            style={{ verticalAlign: "-3px", marginRight: "5px" }}
          >
            <use href="#i-copy" />
          </svg>
          {r.makeShare}
        </button>
      </div>

      <div className="grid g-3">
        <div className="stat glass">
          <div className="row">
            <label>{r.totalIn}</label>
            <div className="ico ico-ok">
              <svg>
                <use href="#i-chart" />
              </svg>
            </div>
          </div>
          <div className="val sm" style={{ color: "var(--ok)" }}>
            5.500.000 ₫
          </div>
        </div>
        <div className="stat glass">
          <div className="row">
            <label>{r.totalOut}</label>
            <div className="ico ico-warn">
              <svg>
                <use href="#i-swap" />
              </svg>
            </div>
          </div>
          <div className="val sm" style={{ color: "var(--danger)" }}>
            2.180.000 ₫
          </div>
        </div>
        <div className="stat glass">
          <div className="row">
            <label>{r.endBalance}</label>
            <div className="ico ico-pri">
              <svg>
                <use href="#i-wallet" />
              </svg>
            </div>
          </div>
          <div className="val sm">3.320.000 ₫</div>
        </div>
      </div>

      <div className="grid g-2" style={{ marginTop: "18px" }}>
        <div className="card glass">
          <div className="card-h">
            <h3>{r.structure}</h3>
            <span className="muted">{r.pieChart}</span>
          </div>
          <div className="donut-wrap">
            <div className="donut">
              <svg width="150" height="150" viewBox="0 0 42 42">
                <circle
                  cx="21"
                  cy="21"
                  r="15.9"
                  fill="none"
                  stroke="var(--track)"
                  strokeWidth="5"
                />
                {pieRing.map((dash, i) => (
                  <circle
                    key={i}
                    cx="21"
                    cy="21"
                    r="15.9"
                    fill="none"
                    stroke={pieColors[i]}
                    strokeWidth="5"
                    strokeDasharray={dash}
                    strokeDashoffset={pieOff[i]}
                    transform="rotate(-90 21 21)"
                  />
                ))}
              </svg>
              <div className="center">
                <b>2.18tr</b>
                <small>{r.totalSpent}</small>
              </div>
            </div>
            <div className="legend">
              {pie.map((l, i) => (
                <div className="li" key={i}>
                  <span className="sw" style={{ background: l.c }}></span>
                  {l.name}
                  <b>{l.v}</b>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="card glass">
          <div className="card-h">
            <h3>{r.compare6}</h3>
            <span className="muted">{r.barChart}</span>
          </div>
          <div className="barchart">
            {BARS.map((bar, i) => (
              <div className="col" key={i}>
                <div
                  className="bw"
                  style={{ height: bar.h, background: bar.grad || undefined }}
                ></div>
                <small>{r.months6[i]}</small>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="card glass" style={{ marginTop: "18px" }}>
        <div className="card-h">
          <h3>{r.trend}</h3>
          <span className="muted">{r.lineChart}</span>
        </div>
        <svg
          width="100%"
          height="170"
          viewBox="0 0 600 170"
          preserveAspectRatio="none"
          style={{ overflow: "visible" }}
        >
          <polyline
            fill="none"
            stroke="var(--accent)"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            points="10,120 110,80 210,135 310,55 410,95 510,70 590,40"
          />
          <polyline
            fill="url(#fillgrad)"
            stroke="none"
            points="10,120 110,80 210,135 310,55 410,95 510,70 590,40 590,170 10,170"
          />
          <defs>
            <linearGradient id="fillgrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.25" />
              <stop offset="100%" stopColor="var(--accent)" stopOpacity="0" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      <div className="card glass" style={{ marginTop: "18px" }}>
        <div className="card-h">
          <h3>{r.shareTitle}</h3>
        </div>
        <p
          style={{
            fontSize: ".82rem",
            color: "var(--text-dim)",
            marginBottom: "8px",
          }}
        >
          {r.shareDesc}
        </p>
        <div className="sharebox">
          <svg width="18" height="18" style={{ color: "var(--text-dim)" }}>
            <use href="#i-percent" />
          </svg>
          <code>MW-2K6F-9X7A</code>
          <button className="btn" style={{ padding: "7px 12px" }}>
            <svg width="15" height="15" style={{ verticalAlign: "-2px" }}>
              <use href="#i-copy" />
            </svg>
          </button>
        </div>
      </div>
    </>
  );
}
