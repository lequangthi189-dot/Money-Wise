import { useEffect, useState } from "react";
import { Icon } from "./icons";
import { createTransaction, fetchPaymentMethods } from "../../models/giaoDichData";
import { useAppData } from "../../context/AppDataContext";

const QUICK_ENTRY_CONFIG = {
  ignoredWords: ["hom", "nay", "qua", "vao", "luc", "ngay", "thang", "nam", "tien", "mat", "vi", "dien", "tu", "the", "ngan", "hang", "chuyen", "khoan", "mua", "tra", "chi", "thu", "nhan", "duoc", "bang", "cho", "mot", "trieu", "nghin"],
  incomeWords: ["thu ", "nhận", "lương", "thưởng", "tiền vào", "bán được"],
  expenseWords: ["chi ", "mua", "trả", "đóng", "ăn", "uống", "tiền ra"],
  methodAliases: {
    cash: ["tiền mặt", "cash"],
    ewallet: ["ví điện tử", "momo", "zalo pay", "zalopay", "vnpay"],
    card: ["thẻ", "chuyển khoản", "ngân hàng", "bank"],
  },
  amountSuffixes: { k: 1000, nghìn: 1000, ngàn: 1000, tr: 1000000, triệu: 1000000 },
  todayWords: ["hôm nay"],
  yesterdayWords: ["hôm qua"],
};

function localDateISO(value) {
  return new Date(value.getTime() - value.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
}

function normalizeSuggestionText(value) {
  return String(value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .toLowerCase();
}

function suggestionTokens(value, config) {
  const ignoredWords = new Set(config.ignoredWords ?? []);
  return new Set(normalizeSuggestionText(value)
    .replace(/\d[\d.,]*/g, " ")
    .split(/[^a-z]+/)
    .filter((word) => word.length > 1 && !ignoredWords.has(word)));
}

function suggestCategory(text, categories, history, config) {
  const normalizedText = normalizeSuggestionText(text);
  const direct = categories.find((item) => normalizedText.includes(normalizeSuggestionText(item.name)));
  if (direct) return { category: direct, source: "name" };

  const inputTokens = suggestionTokens(text, config);
  if (!inputTokens.size) return { category: null, source: "" };

  const scores = new Map();
  history.forEach((transaction) => {
    const category = categories.find((item) => String(item.id) === String(transaction.categoryId));
    if (!category) return;
    const matched = [...suggestionTokens(transaction.name, config)].filter((token) => inputTokens.has(token)).length;
    if (matched > 0) scores.set(category.id, (scores.get(category.id) ?? 0) + matched);
  });

  const best = [...scores.entries()].sort((a, b) => b[1] - a[1])[0];
  return { category: best ? categories.find((item) => item.id === best[0]) ?? null : null, source: best ? "history" : "" };
}

function parseMessage(text, categories, methods, history, config) {
  const words = text.toLowerCase();
  const match = words.match(/(\d[\d.,]*)\s*([a-zA-ZÀ-ỹ]+)?/);
  if (!match) return null;
  const suffix = (match[2] ?? "").toLowerCase();
  let amount = suffix
    ? Number(match[1].replace(",", "."))
    : Number(match[1].replace(/[.,]/g, ""));
  if (!Number.isFinite(amount) || amount <= 0) return null;
  amount *= Number(config.amountSuffixes?.[suffix] ?? 1);

  const incomeWords = config.incomeWords ?? [];
  const expenseWords = config.expenseWords ?? [];
  const suggestion = suggestCategory(text, categories, history, config);
  const matchedCategory = suggestion.category;
  const type = incomeWords.some((word) => words.includes(word))
    ? "in"
    : expenseWords.some((word) => words.includes(word))
      ? "out"
      : matchedCategory?.type ?? "";
  const category = matchedCategory?.type === type ? matchedCategory : null;

  const methodAliases = config.methodAliases ?? {};
  const method = methods.find((item) =>
    words.includes(item.name.toLowerCase()) ||
    (methodAliases[item.mkey] ?? []).some((alias) => words.includes(alias)),
  ) ?? null;

  const today = new Date();
  let date = localDateISO(today);
  if ((config.todayWords ?? []).some((word) => words.includes(word))) date = localDateISO(today);
  else if ((config.yesterdayWords ?? []).some((word) => words.includes(word))) {
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    date = localDateISO(yesterday);
  } else {
    const iso = words.match(/\b(\d{4})-(\d{1,2})-(\d{1,2})\b/);
    const local = words.match(/\b(\d{1,2})[/-](\d{1,2})(?:[/-](\d{4}))?\b/);
    if (iso) date = `${iso[1]}-${iso[2].padStart(2, "0")}-${iso[3].padStart(2, "0")}`;
    else if (local) date = `${local[3] ?? today.getFullYear()}-${local[2].padStart(2, "0")}-${local[1].padStart(2, "0")}`;
  }

  return { amount, type, category, method, date, note: text, suggestionSource: category ? suggestion.source : "", suggestedCategoryId: category?.id ?? null };
}

export default function ChatPanel({ onClose, userId, onSaved, onOpenCategories }) {
  const { categories: appCategories, transactions: appTransactions } = useAppData();
  const [text, setText] = useState("");
  const [parsed, setParsed] = useState(null);
  const [categories, setCategories] = useState([]);
  const [methods, setMethods] = useState([]);
  const [history, setHistory] = useState([]);
  const [message, setMessage] = useState("");

  useEffect(() => {
    let active = true;

    async function loadChatData() {
      try {
        const paymentMethods = await fetchPaymentMethods();
        if (!active) return;
        setCategories(appCategories);
        setMethods(paymentMethods);
        setHistory(appTransactions);
        setMessage("");
      } catch (error) {
        if (active) setMessage(error.message);
      }
    }

    loadChatData();
    return () => { active = false; };
  }, [appCategories, appTransactions]);

  async function send() {
    const result = parseMessage(text, categories, methods, history, QUICK_ENTRY_CONFIG);
    setParsed(result);
    if (!result) setMessage("Không tìm thấy số tiền trong nội dung.");
    else setMessage("");
  }

  async function save() {
    if (!parsed?.type || !parsed?.category || !parsed?.method || !parsed?.date || parsed.amount <= 0) {
      setMessage("Vui lòng chọn đủ loại, danh mục, phương thức, ngày và số tiền.");
      return;
    }
    try {
      await createTransaction({ userId, categoryId: parsed.category.id, methodId: parsed.method.id, type: parsed.type, amount: parsed.amount, date: parsed.date, note: parsed.note });
      setHistory((old) => [{ name: parsed.note, categoryId: parsed.category.id, type: parsed.type }, ...old]);
      setMessage("Đã lưu giao dịch.");
      setParsed(null);
      setText("");
      await onSaved?.();
    } catch (error) { setMessage(error.message); }
  }

  return <div className="chatpanel show">
    <div className="chathead"><div className="bot"><Icon n="i-msg" /></div><div><b>Trợ lý MoneyWise</b><small>● Đang hoạt động</small></div><button className="x" onClick={onClose}>×</button></div>
    <div className="chatbody">
      <div className="msg bot">Mô tả khoản thu hoặc chi, ví dụ: “hôm qua nhận lương 8tr qua ngân hàng” hoặc “hôm nay uống trà sữa 35k tiền mặt”.</div>
      {message && <div className="msg bot">{message}</div>}
      {parsed && <div className="msg bot"><div className="parsed">
        <div className="pr"><span>Loại</span><select value={parsed.type} onChange={(e) => setParsed((old) => ({ ...old, type: e.target.value, category: null, suggestionSource: "", suggestedCategoryId: null }))}><option value="">Chọn loại</option><option value="out">Chi</option><option value="in">Thu</option></select></div>
        <div className="pr"><span>Số tiền</span><input type="number" min="1" value={parsed.amount} onChange={(e) => setParsed((old) => ({ ...old, amount: Number(e.target.value) }))} /></div>
        <div className="pr"><span>Danh mục</span><select value={parsed.category?.id ?? ""} onChange={(e) => setParsed((old) => ({ ...old, category: categories.find((item) => String(item.id) === e.target.value) ?? null, suggestionSource: "" }))}><option value="">Chọn danh mục</option>{categories.filter((item) => item.type === parsed.type).map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></div>
        {parsed.category && parsed.suggestionSource && <small className="suggestion-note">{parsed.suggestionSource === "history" ? "Danh mục được gợi ý từ các giao dịch bạn đã xác nhận trước đây." : "Danh mục được gợi ý từ nội dung bạn nhập."}</small>}
        {!parsed.category && parsed.type && <div className="suggestion-note suggestion-missing">
          <span>Không tìm thấy danh mục phù hợp. Bạn có thể chọn danh mục có sẵn hoặc tự tạo danh mục mới.</span>
          <button type="button" onClick={onOpenCategories}>Đi đến Danh mục</button>
        </div>}
        <div className="pr"><span>Phương thức</span><select value={parsed.method?.id ?? ""} onChange={(e) => setParsed((old) => ({ ...old, method: methods.find((item) => String(item.id) === e.target.value) ?? null }))}><option value="">Chọn phương thức</option>{methods.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></div>
        <div className="pr"><span>Ngày</span><input type="date" max={localDateISO(new Date())} value={parsed.date} onChange={(e) => setParsed((old) => ({ ...old, date: e.target.value }))} /></div>
        <div className="pbtn"><button className="ok" disabled={!parsed.type || !parsed.category || !parsed.method || !parsed.date || parsed.amount <= 0} onClick={save}>✓ Lưu</button><button className="edit" onClick={() => setParsed(null)}>Nhập lại</button></div>
      </div></div>}
    </div>
    <div className="chatfoot"><input value={text} onChange={(e) => setText(e.target.value)} onKeyDown={(e) => e.key === "Enter" && send()} placeholder="Nhập khoản thu hoặc chi…" /><button className="send" onClick={send}><Icon n="i-send" size={18} /></button></div>
  </div>;
}
