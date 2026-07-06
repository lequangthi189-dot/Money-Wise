import "../Css/Pages/categories.css";

const EXPENSE = [
  { id: 1, icon: "🍜", cls: "c-food", key: "food" },
  { id: 2, icon: "🛵", cls: "c-move", key: "move" },
  { id: 3, icon: "📚", cls: "c-edu", key: "edu" },
  { id: 4, icon: "🏠", cls: "c-rent", key: "rent" },
  { id: 5, icon: "🎮", cls: "c-fun", key: "fun" },
  { id: 6, icon: "🛍️", cls: "c-shop", key: "shop" },
  { id: 7, icon: "☕", cls: "c-coffee", key: "coffee" },
  { id: 8, icon: "❤️", cls: "c-health", key: "health" },
];
const INCOME = [
  { id: 9, icon: "💰", cls: "c-salary", key: "salary" },
  { id: 10, icon: "👨‍👩‍👧", cls: "c-salary", key: "family" },
  { id: 11, icon: "🎓", cls: "c-salary", key: "scholar" },
];

function CatCard({ c, type, t }) {
  return (
    <div className="catcard">
      <div className={"cat " + c.cls}>{c.icon}</div>
      <div className="meta">
        <b>{t.cats[c.key]}</b>
      </div>
      <span className={"badge " + (type === "in" ? "b-in" : "b-out")}>
        {type === "in" ? t.thu : t.chi}
      </span>
      <div className="act">
        <button aria-label="edit">
          <svg width="15" height="15">
            <use href="#i-edit" />
          </svg>
        </button>
        <button aria-label="delete">
          <svg width="15" height="15">
            <use href="#i-trash" />
          </svg>
        </button>
      </div>
    </div>
  );
}

export default function Categories({ t }) {
  const c = t.categories;
  return (
    <div className="card glass">
      <div className="card-h">
        <div>
          <h3>{c.heading}</h3>
          <span className="muted">{c.sub}</span>
        </div>
        <button className="btn btn-primary">
          <svg
            width="16"
            height="16"
            style={{ marginRight: "6px", verticalAlign: "-2px" }}
          >
            <use href="#i-plus" />
          </svg>
          {c.add}
        </button>
      </div>

      <div className="nav-label" style={{ padding: "6px 0" }}>
        {c.expenseGroup}
      </div>
      <div className="catgrid">
        {EXPENSE.map((x) => (
          <CatCard key={x.id} c={x} type="out" t={t} />
        ))}
      </div>

      <div className="nav-label" style={{ padding: "16px 0 6px" }}>
        {c.incomeGroup}
      </div>
      <div className="catgrid">
        {INCOME.map((x) => (
          <CatCard key={x.id} c={x} type="in" t={t} />
        ))}
      </div>
    </div>
  );
}
