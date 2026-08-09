import { useEffect, useState } from "react";
import { Icon } from "./icons";
import { createChatAnalysis, createTransaction, createTransactions, fetchPaymentMethods, suggestTransactionCategory, updateChatAnalysis } from "../../models/giaoDichData";
import { useAppData } from "../../context/AppDataContext";
import { parseMoney } from "../../models/format";

const QUICK_ENTRY_CONFIG = {
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

function parseMessage(text, methods, config) {
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
  const type = incomeWords.some((word) => words.includes(word))
    ? "in"
    : expenseWords.some((word) => words.includes(word))
      ? "out"
      : "";

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

  return { amount, type, category: null, method, date, note: text, suggestionSource: "", suggestedCategoryId: null, analysisId: null };
}

function parseMultipleMessages(text, methods, config) {
  const matches = [...text.matchAll(/(\d[\d.,]*)\s*(k|nghìn|ngàn|tr|triệu|m)\b/giu)];
  if (matches.length < 2) return [];
  const shared = parseMessage(text, methods, config);
  if (!shared) return [];

  return matches.map((match, index) => {
    const suffix = match[2].toLowerCase();
    const amount = Number(match[1].replace(",", ".")) * Number(config.amountSuffixes[suffix]);
    const end = matches[index + 1]?.index ?? text.length;
    const note = text.slice(match.index, end).replace(/(?:\s|,|;)*(?:rồi|và|and|then)?(?:\s|,|;)*$/iu, "").trim();
    return { ...shared, amount, note, category: null, suggestionSource: "", suggestedCategoryId: null, analysisId: null };
  }).filter((item) => Number.isFinite(item.amount) && item.amount > 0);
}

const normalizeLabel = (value) => String(value ?? "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();

function parseTransactionTable(text, categories, methods, config) {
  const normalizedTable = text.replace(/\|\s*\|/g, "|\n|");
  const rows = normalizedTable.split(/\r?\n/).map((line) => {
    const trimmed = line.trim();
    const delimiter = trimmed.includes("|") ? "|" : trimmed.includes("\t") ? "\t" : null;
    if (!delimiter) return [];
    const cells = trimmed.split(delimiter).map((cell) => cell.trim());
    if (!cells[0]) cells.shift();
    if (!cells.at(-1)) cells.pop();
    return cells;
  });
  return rows.filter((cells) => /^\d+$/.test(cells[0] ?? "") && cells.length >= 6).map((cells) => {
    const [, dateText, categoryText, note, amountText, methodText] = cells;
    const dateParts = dateText.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{4})$/);
    const date = dateParts ? `${dateParts[3]}-${dateParts[2].padStart(2, "0")}-${dateParts[1].padStart(2, "0")}` : "";
    const categoryLabel = normalizeLabel(categoryText);
    const category = categories.find((item) => normalizeLabel(item.name) === categoryLabel) ?? null;
    const methodWords = normalizeLabel(methodText);
    const method = methods.find((item) => methodWords.includes(normalizeLabel(item.name)) || (config.methodAliases[item.mkey] ?? []).some((alias) => methodWords.includes(normalizeLabel(alias)))) ?? null;
    return {
      amount: parseMoney(amountText), type: category?.type || "out", category, method, date, note,
      suggestionSource: category ? "name" : "", suggestedCategoryId: category?.id ?? null, analysisId: null,
    };
  }).filter((item) => Number.isFinite(item.amount) && item.amount > 0 && item.date && item.note);
}

async function applyBackendSuggestion(value, text, categories) {
  const suggestion = await suggestTransactionCategory(text, value.type);
  if (!suggestion) return value;
  const category = categories.find((item) => String(item.id) === String(suggestion.categoryId)) ?? null;
  if (!category) return value;
  return {
    ...value,
    type: value.type || suggestion.categoryType || category.type,
    category,
    suggestedCategoryId: category.id,
    suggestionSource: suggestion.source === "LICH_SU" || suggestion.source === "GIAO_DICH_CU" ? "history" : "name",
  };
}

function nextQuestion(value, text) {
  if (!value?.type) return text.askType;
  if (!value?.category) return text.askCategory;
  if (!value?.method) return text.askMethod;
  if (!value?.date) return text.askDate;
  return "";
}

async function applyFollowUp(text, current, categories, methods, config) {
  const words = text.toLowerCase();
  let type = current.type;
  if (!type) {
    if (["thu", "income"].includes(words.trim()) || config.incomeWords.some((word) => words.includes(word))) type = "in";
    else if (["chi", "expense"].includes(words.trim()) || config.expenseWords.some((word) => words.includes(word))) type = "out";
  }
  const method = current.method ?? methods.find((item) =>
    words.includes(item.name.toLowerCase()) ||
    (config.methodAliases[item.mkey] ?? []).some((alias) => words.includes(alias)),
  ) ?? null;
  const updated = {
    ...current,
    type,
    method,
  };
  return current.category ? updated : applyBackendSuggestion(updated, text, categories);
}

export default function ChatPanel({ t, onClose, userId, onSaved, onOpenCategories }) {
  const c = t.chat;
  const { categories: appCategories } = useAppData();
  const [text, setText] = useState("");
  const [parsed, setParsed] = useState(null);
  const [parsedBatch, setParsedBatch] = useState([]);
  const [categories, setCategories] = useState([]);
  const [methods, setMethods] = useState([]);
  const [message, setMessage] = useState("");

  useEffect(() => {
    let active = true;

    async function loadChatData() {
      try {
        const paymentMethods = await fetchPaymentMethods();
        if (!active) return;
        setCategories(appCategories);
        setMethods(paymentMethods);
        setMessage("");
      } catch (error) {
        if (active) setMessage(error.message);
      }
    }

    loadChatData();
    return () => { active = false; };
  }, [appCategories]);

  async function send() {
    if (!text.trim()) return;
    if (parsedBatch.length) {
      setMessage(c.finishBatchFirst);
      return;
    }
    if (parsed && nextQuestion(parsed, c)) {
      let updated;
      try {
        updated = await applyFollowUp(text, parsed, categories, methods, QUICK_ENTRY_CONFIG);
      } catch (error) {
        setMessage(error.message);
        return;
      }
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
    const tableItems = parseTransactionTable(text, categories, methods, QUICK_ENTRY_CONFIG);
    const multiple = tableItems.length ? tableItems : parseMultipleMessages(text, methods, QUICK_ENTRY_CONFIG);
    if (tableItems.length || multiple.length > 1) {
      try {
        const suggested = await Promise.all(multiple.map((item) => item.category ? item : applyBackendSuggestion(item, item.note, categories)));
        const withAnalysis = await Promise.all(suggested.map(async (item) => {
          let analysisId = null;
          try {
            analysisId = await createChatAnalysis({
              userId, text: item.note, amount: item.amount, type: item.type, categoryId: item.category?.id,
              date: item.date, methodId: item.method?.id, question: "", status: "DA_PHAN_TICH",
            });
          } catch (error) { console.warn("Không thể lưu phân tích chatbot:", error.message); }
          return { ...item, analysisId };
        }));
        setParsed(null);
        setParsedBatch(withAnalysis);
        setText("");
        setMessage(c.batchReady(withAnalysis.length));
      } catch (error) { setMessage(error.message); }
      return;
    }

    let result = parseMessage(text, methods, QUICK_ENTRY_CONFIG);
    if (!result) setMessage(c.noAmount);
    else {
      try {
        result = await applyBackendSuggestion(result, text, categories);
      } catch (error) {
        setMessage(error.message);
        return;
      }
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
      setMessage(c.saved);
      setParsed(null);
      setText("");
      await onSaved?.();
    } catch (error) { setMessage(error.message); }
  }

  function updateBatch(index, patch) {
    setParsedBatch((items) => items.map((item, itemIndex) => itemIndex === index ? { ...item, ...patch } : item));
  }

  async function saveBatch() {
    if (!parsedBatch.length || parsedBatch.some((item) => !item.type || !item.category || !item.method || !item.date || item.amount <= 0)) {
      setMessage(c.batchIncomplete);
      return;
    }
    try {
      const transactionIds = await createTransactions(parsedBatch.map((item) => ({
        userId, categoryId: item.category.id, methodId: item.method.id, type: item.type,
        amount: item.amount, date: item.date, note: item.note,
      })));
      await Promise.allSettled(parsedBatch.map((item, index) => updateChatAnalysis(item.analysisId, {
        amount: item.amount, type: item.type, categoryId: item.category.id, date: item.date,
        methodId: item.method.id, question: "", status: "DA_XAC_NHAN", transactionId: transactionIds[index],
      })));
      setMessage(c.batchSaved(parsedBatch.length));
      setParsedBatch([]);
      setText("");
      await onSaved?.();
    } catch (error) { setMessage(error.message); }
  }

  return <div className="chatpanel show">
    <div className="chathead"><div className="bot"><Icon n="i-msg" /></div><div><b>{c.title}</b><small>{c.online}</small></div><button className="x" onClick={onClose}>×</button></div>
    <div className="chatbody">
      <div className="msg bot">{c.intro}</div>
      {message && <div className="msg bot">{message}</div>}
      {parsed && <div className="msg bot transaction-review"><div className="parsed">
        <div className="pr"><span>{c.type}</span><select value={parsed.type} onChange={(e) => setParsed((old) => ({ ...old, type: e.target.value, category: null, suggestionSource: "", suggestedCategoryId: null }))}><option value="">{c.chooseType}</option><option value="out">{c.expense}</option><option value="in">{c.income}</option></select></div>
        <div className="pr"><span>{c.amount}</span><input type="number" min="1" value={parsed.amount} onChange={(e) => setParsed((old) => ({ ...old, amount: Number(e.target.value) }))} /></div>
        <div className="pr pr-note"><span>{c.note}</span><textarea value={parsed.note} onChange={(e) => setParsed((old) => ({ ...old, note: e.target.value }))} placeholder={c.notePlaceholder} /></div>
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
      {parsedBatch.length > 0 && <div className="msg bot batch-review">
        <b>{c.batchTitle(parsedBatch.length)}</b>
        {parsedBatch.map((item, index) => <div className="parsed batch-item" key={`${item.note}-${index}`}>
          <small>{c.batchItem(index + 1)}</small>
          <div className="pr"><span>{c.type}</span><select value={item.type} onChange={(e) => updateBatch(index, { type: e.target.value, category: null })}><option value="">{c.chooseType}</option><option value="out">{c.expense}</option><option value="in">{c.income}</option></select></div>
          <div className="pr"><span>{c.amount}</span><input type="number" min="1" value={item.amount} onChange={(e) => updateBatch(index, { amount: Number(e.target.value) })} /></div>
          <div className="pr pr-note"><span>{c.note}</span><textarea value={item.note} onChange={(e) => updateBatch(index, { note: e.target.value })} placeholder={c.notePlaceholder} /></div>
          <div className="pr"><span>{c.category}</span><select value={item.category?.id ?? ""} onChange={(e) => updateBatch(index, { category: categories.find((category) => String(category.id) === e.target.value) ?? null })}><option value="">{c.chooseCategory}</option>{categories.filter((category) => category.type === item.type).map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}</select></div>
          <div className="pr"><span>{c.method}</span><select value={item.method?.id ?? ""} onChange={(e) => updateBatch(index, { method: methods.find((method) => String(method.id) === e.target.value) ?? null })}><option value="">{c.chooseMethod}</option>{methods.map((method) => <option key={method.id} value={method.id}>{t.methods[method.mkey] ?? method.name}</option>)}</select></div>
          <div className="pr"><span>{c.date}</span><input type="date" max={localDateISO(new Date())} value={item.date} onChange={(e) => updateBatch(index, { date: e.target.value })} /></div>
        </div>)}
        <div className="pbtn"><button className="ok" onClick={saveBatch}>{c.saveBatch}</button><button className="edit" onClick={() => setParsedBatch([])}>{c.retry}</button></div>
      </div>}
    </div>
    <div className="chatfoot"><textarea value={text} onChange={(e) => setText(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }} placeholder={c.placeholder} rows="1" /><button className="send" onClick={send}><Icon n="i-send" size={18} /></button></div>
  </div>;
}
