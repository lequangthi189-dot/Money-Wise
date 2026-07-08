import { THEMES } from "../../models/constants";
import { Icon } from "../components/icons";

export default function Settings({
  theme,
  setTheme,
  fontSize,
  setFontSize,
  lang,
  setLang,
  s,
}) {
  return (
    <>
      <div className="card glass" style={{ marginBottom: "18px" }}>
        <div className="card-h">
          <h3>{s.theme}</h3>
          <span className="muted">{s.themeSub}</span>
        </div>
        <div className="themecards">
          {THEMES.map((t) => (
            <div
              key={t.id}
              className={"themecard" + (theme === t.id ? " sel" : "")}
              onClick={() => setTheme(t.id)}
            >
              <div className={"prev " + t.prev}>
                <div className="mini" style={{ width: "60%" }}></div>
                <div className="mini" style={{ width: "90%" }}></div>
                <div className="mini" style={{ width: "75%" }}></div>
              </div>
              <div className="nm">{t.name}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid g-2">
        <div className="card glass">
          <div className="card-h">
            <h3>{s.display}</h3>
          </div>
          <div className="field">
            <label>
              {s.fontSize} ({fontSize}px)
            </label>
            <input
              type="range"
              min="14"
              max="20"
              value={fontSize}
              onChange={(e) => setFontSize(+e.target.value)}
            />
          </div>
          <div className="field">
            <label>{s.language}</label>
            <select value={lang} onChange={(e) => setLang(e.target.value)}>
              <option value="vi">Tiếng Việt</option>
              <option value="en">English</option>
            </select>
          </div>
        </div>

        <div className="card glass">
          <div className="card-h">
            <h3>{s.account}</h3>
          </div>
          <div className="field">
            <label>{s.name}</label>
            <input defaultValue="Thi Nguyễn" />
          </div>
          <div className="field">
            <label>{s.email}</label>
            <input defaultValue="thi@huflit.edu.vn" />
          </div>
          <div className="field">
            <label>{s.phone}</label>
            <input defaultValue="0909 xxx xxx" />
          </div>
          <div className="btn-row">
            <button className="btn" style={{ flex: "1" }}>
              {s.changePw}
            </button>
            <button className="btn" style={{ color: "var(--danger)" }}>
              <Icon n="i-logout" size={15} /> {s.logout}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
