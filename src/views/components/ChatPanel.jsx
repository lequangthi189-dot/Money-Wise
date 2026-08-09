import { useEffect, useState } from "react";
import { Icon } from "./icons";
import { createChatAnalysis, createTransaction, fetchPaymentMethods, updateChatAnalysis } from "../../models/giaoDichData";
import { useAppData } from "../../context/AppDataContext";

const QUICK_ENTRY_CONFIG = {
  ignoredWords: ["hom", "nay", "qua", "vao", "luc", "ngay", "thang", "nam", "tien", "mat", "vi", "dien", "tu", "the", "ngan", "hang", "chuyen", "khoan", "mua", "tra", "chi", "thu", "nhan", "duoc", "bang", "cho", "mot", "trieu", "nghin"],
  incomeWords: ["thu ", "nhận", "lương", "thưởng", "tiền vào", "bán được", "income", "received", "salary", "earned"],
  expenseWords: ["chi ", "mua", "trả", "đóng", "ăn", "uống", "tiền ra", "expense", "spent", "paid", "bought", "buy"],
  methodAliases: {
    cash: ["tiền mặt", "cash"],
    ewallet: ["ví điện tử", "momo", "zalo pay", "zalopay", "vnpay"],
    card: ["thẻ", "chuyển khoản", "ngân hàng", "bank"],
  },
  amountSuffixes: { k: 1000, nghìn: 1000, ngàn: 1000, tr: 1000000, triệu: 1000000, m: 1000000 },
  todayWords: ["hôm nay", "today"],
  yesterdayWords: ["hôm qua", "yesterday"],
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

  return { amount, type, category, method, date, note: text, suggestionSource: category ? suggestion.source : "", suggestedCategoryId: category?.id ?? null, analysisId: null };
}

function nextQuestion(value, text) {
  if (!value?.type) return text.askType;
  if (!value?.category) return text.askCategory;
  if (!value?.method) return text.askMethod;
  if (!value?.date) return text.askDate;
  return "";
}

function applyFollowUp(text, current, categories, methods, history, config) {
  const words = text.toLowerCase();
  let type = current.type;
  if (!type) {
    if (["thu", "income"].includes(words.trim()) || config.incomeWords.some((word) => words.includes(word))) type = "in";
    else if (["chi", "expense"].includes(words.trim()) || config.expenseWords.some((word) => words.includes(word))) type = "out";
  }
  const suggestion = !current.category ? suggestCategory(text, categories, history, config) : { category: current.category, source: current.suggestionSource };
  const category = suggestion.category?.type === type ? suggestion.category : current.category;
  const method = current.method ?? methods.find((item) =>
    words.includes(item.name.toLowerCase()) ||
    (config.methodAliases[item.mkey] ?? []).some((alias) => words.includes(alias)),
  ) ?? null;
  return {
    ...current,
    type,
    category,
    method,
    suggestionSource: category && !current.category ? suggestion.source : current.suggestionSource,
  };
}

export default function ChatPanel({ t, onClose, userId, onSaved, onOpenCategories }) {
  const c = t.chat;
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
    if (!text.trim()) return;
    if (parsed && nextQuestion(parsed, c)) {
      const updated = applyFollowUp(text, parsed, categories, methods, history, QUICK_ENTRY_CONFIG);
      const question = nextQuestion(updated, c);
      setParsed(updated);
      setText("");
      setMessage(question || c.readyToConfirm);
      try {
        await updateChatAnalysis(updated.analysisId, {
          amount: updated.amount, type: updated.type, categoryId: updated.category?.id,
          date: updated.date, methodId: updated.method?.id, question,
          status: question ? "CHO_BO_SUNG" : "DA_PHAN_TICH",
        });
      } catch (error) { console.warn("Không thể cập nhật phân tích chatbot:", error.message); }
      return;
    }
    const result = parseMessage(text, categories, methods, history, QUICK_ENTRY_CONFIG);
    if (!result) setMessage(c.noAmount);
    else {
      const question = nextQuestion(result, c);
      try {
        result.analysisId = await createChatAnalysis({
          userId, text, amount: result.amount, type: result.type, categoryId: result.category?.id,
          date: result.date, methodId: result.method?.id, question,
          status: question ? "CHO_BO_SUNG" : "DA_PHAN_TICH",
        });
      } catch (error) { console.warn("Không thể lưu phân tích chatbot:", error.message); }
      setParsed(result);
      setText("");
      setMessage(question || c.readyToConfirm);
    }
  }

  async function save() {
    if (!parsed?.type || !parsed?.category || !parsed?.method || !parsed?.date || parsed.amount <= 0) {
      setMessage(c.incomplete);
      return;
    }
    try {
      const transactionId = await createTransaction({ userId, categoryId: parsed.category.id, methodId: parsed.method.id, type: parsed.type, amount: parsed.amount, date: parsed.date, note: parsed.note, source: "chatbot" });
      try {
        await updateChatAnalysis(parsed.analysisId, { amount: parsed.amount, type: parsed.type, categoryId: parsed.category.id, date: parsed.date, methodId: parsed.method.id, question: "", status: "DA_XAC_NHAN", transactionId });
      } catch (analysisError) {
        console.warn("Giao dịch đã lưu nhưng không cập nhật được phân tích chatbot:", analysisError.message);
      }
      setHistory((old) => [{ name: parsed.note, categoryId: parsed.category.id, type: parsed.type }, ...old]);
      setMessage(c.saved);
      setParsed(null);
      setText("");
      await onSaved?.();
    } catch (error) { setMessage(error.message); }
  }

  return <div className="chatpanel show">
    <div className="chathead"><div className="bot"><Icon n="i-msg" /></div><div><b>{c.title}</b><small>{c.online}</small></div><button className="x" onClick={onClose}>×</button></div>
    <div className="chatbody">
      <div className="msg bot">{c.intro}</div>
      {message && <div className="msg bot">{message}</div>}
      {parsed && <div className="msg bot"><div className="parsed">
        <div className="pr"><span>{c.type}</span><select value={parsed.type} onChange={(e) => setParsed((old) => ({ ...old, type: e.target.value, category: null, suggestionSource: "", suggestedCategoryId: null }))}><option value="">{c.chooseType}</option><option value="out">{c.expense}</option><option value="in">{c.income}</option></select></div>
        <div className="pr"><span>{c.amount}</span><input type="number" min="1" value={parsed.amount} onChange={(e) => setParsed((old) => ({ ...old, amount: Number(e.target.value) }))} /></div>
        <div className="pr"><span>{c.category}</span><select value={parsed.category?.id ?? ""} onChange={(e) => setParsed((old) => ({ ...old, category: categories.find((item) => String(item.id) === e.target.value) ?? null, suggestionSource: "" }))}><option value="">{c.chooseCategory}</option>{categories.filter((item) => item.type === parsed.type).map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></div>
        {parsed.category && parsed.suggestionSource && <small className="suggestion-note">{parsed.suggestionSource === "history" ? c.suggestedFromHistory : c.suggestedFromText}</small>}
        {!parsed.category && parsed.type && <div className="suggestion-note suggestion-missing">
          <span>{c.noSuggestion}</span>
          <button type="button" onClick={onOpenCategories}>{c.openCategories}</button>
        </div>}
        <div className="pr"><span>{c.method}</span><select value={parsed.method?.id ?? ""} onChange={(e) => setParsed((old) => ({ ...old, method: methods.find((item) => String(item.id) === e.target.value) ?? null }))}><option value="">{c.chooseMethod}</option>{methods.map((item) => <option key={item.id} value={item.id}>{t.methods[item.mkey] ?? item.name}</option>)}</select></div>
        <div className="pr"><span>{c.date}</span><input type="date" max={localDateISO(new Date())} value={parsed.date} onChange={(e) => setParsed((old) => ({ ...old, date: e.target.value }))} /></div>
        <div className="pbtn"><button className="ok" disabled={!parsed.type || !parsed.category || !parsed.method || !parsed.date || parsed.amount <= 0} onClick={save}>{c.save}</button><button className="edit" onClick={() => setParsed(null)}>{c.retry}</button></div>
      </div></div>}
    </div>
    <div className="chatfoot"><input value={text} onChange={(e) => setText(e.target.value)} onKeyDown={(e) => e.key === "Enter" && send()} placeholder={c.placeholder} /><button className="send" onClick={send}><Icon n="i-send" size={18} /></button></div>
  </div>;
}
