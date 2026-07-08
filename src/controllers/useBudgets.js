import { useState } from "react";
import {
  INITIAL_TOTAL_LIMIT,
  INITIAL_TOTAL_SPENT,
} from "../models/budgetsData";

// Controller: quản lý hạn mức tổng — nhập/lưu hạn mức, tính phần trăm đã dùng
// và số tiền còn lại.
export function useBudgets() {
  const [totalLimit, setTotalLimit] = useState(INITIAL_TOTAL_LIMIT);
  const [totalSpent] = useState(INITIAL_TOTAL_SPENT);
  const [limitInput, setLimitInput] = useState(String(INITIAL_TOTAL_LIMIT));
  const [limitType, setLimitType] = useState("total");
  const [selectedCategory, setSelectedCategory] = useState("coffee");

  const totalPct = Math.round((totalSpent / totalLimit) * 100);
  const totalLeft = totalLimit - totalSpent;

  function handleSaveLimit() {
    const value = Number(limitInput.replaceAll(".", "").replaceAll(",", ""));

    if (value <= 0 || Number.isNaN(value)) {
      alert("Hạn mức phải lớn hơn 0");
      return;
    }

    setTotalLimit(value);
  }

  return {
    totalLimit,
    totalSpent,
    limitInput,
    setLimitInput,
    limitType,
    setLimitType,
    selectedCategory,
    setSelectedCategory,
    totalPct,
    totalLeft,
    handleSaveLimit,
  };
}
