import { beforeEach, expect, test, vi } from "vitest";
import { renderHook } from "@testing-library/react";
import { useAnnualBudgetSummary } from "./useAnnualBudgetSummary";

vi.mock("dexie-react-hooks", () => ({
  useLiveQuery: vi.fn(),
}));

import { useLiveQuery } from "dexie-react-hooks";

const CURRENT_YEAR = new Date().getFullYear().toString();

function makeDate(year: string, month: string, day = "01") {
  return `${year}-${month}-${day}`;
}

beforeEach(() => {
  vi.clearAllMocks();
});

test("正常系: データがロード中はstatus=loadingを返す", () => {
  vi.mocked(useLiveQuery).mockReturnValue(undefined);

  const { result } = renderHook(() => useAnnualBudgetSummary());

  expect(result.current.status).toBe("loading");
});

test("正常系: 年予算が設定されたカテゴリは設定値とcurrentYearTotalを返す", () => {
  vi.mocked(useLiveQuery).mockReturnValue({
    paymentFiles: [
      {
        fileName: "test.csv",
        payments: [
          {
            name: "スーパー",
            date: makeDate(CURRENT_YEAR, "01"),
            price: 5000,
            count: 1,
          },
          {
            name: "スーパー",
            date: makeDate(CURRENT_YEAR, "02"),
            price: 3000,
            count: 1,
          },
        ],
      },
    ],
    categories: [{ id: "cat-1", name: "食費", order: 0, annualBudget: 120000 }],
    allRules: [
      { id: "rule-1", categoryId: "cat-1", pattern: "スーパー", order: 0 },
    ],
  });

  const { result } = renderHook(() => useAnnualBudgetSummary());

  expect(result.current.status).toBe("completed");
  if (result.current.status === "completed") {
    expect(result.current.items).toHaveLength(1);
    const item = result.current.items[0];
    expect(item.categoryName).toBe("食費");
    expect(item.annualBudget).toBe(120000);
    expect(item.isFallback).toBe(false);
    expect(item.currentYearTotal).toBe(8000);
    expect(item.remaining).toBe(112000);
  }
});

test("正常系: 年予算未設定の場合、月平均×12がフォールバックとして使われる", () => {
  vi.mocked(useLiveQuery).mockReturnValue({
    paymentFiles: [
      {
        fileName: "test.csv",
        payments: [
          // 2ヶ月分: 1月3000円、2月5000円 → 合計8000円 / 2ヶ月 * 12 = 48000円
          {
            name: "電車代",
            date: makeDate(CURRENT_YEAR, "01"),
            price: 3000,
            count: 1,
          },
          {
            name: "電車代",
            date: makeDate(CURRENT_YEAR, "02"),
            price: 5000,
            count: 1,
          },
        ],
      },
    ],
    categories: [{ id: "cat-1", name: "交通費", order: 0 }],
    allRules: [
      { id: "rule-1", categoryId: "cat-1", pattern: "電車", order: 0 },
    ],
  });

  const { result } = renderHook(() => useAnnualBudgetSummary());

  expect(result.current.status).toBe("completed");
  if (result.current.status === "completed") {
    expect(result.current.items).toHaveLength(1);
    const item = result.current.items[0];
    expect(item.isFallback).toBe(true);
    expect(item.annualBudget).toBe(48000);
    expect(item.currentYearTotal).toBe(8000);
  }
});

test("正常系: 今年の支出のみcurrentYearTotalに集計される", () => {
  const lastYear = String(Number(CURRENT_YEAR) - 1);

  vi.mocked(useLiveQuery).mockReturnValue({
    paymentFiles: [
      {
        fileName: "file1.csv",
        payments: [
          {
            name: "映画",
            date: makeDate(CURRENT_YEAR, "03"),
            price: 10000,
            count: 1,
          },
        ],
      },
      {
        fileName: "file2.csv",
        payments: [
          {
            name: "映画",
            date: makeDate(lastYear, "06"),
            price: 30000,
            count: 1,
          },
        ],
      },
    ],
    categories: [
      { id: "cat-1", name: "娯楽費", order: 0, annualBudget: 200000 },
    ],
    allRules: [
      { id: "rule-1", categoryId: "cat-1", pattern: "映画", order: 0 },
    ],
  });

  const { result } = renderHook(() => useAnnualBudgetSummary());

  expect(result.current.status).toBe("completed");
  if (result.current.status === "completed") {
    const item = result.current.items[0];
    expect(item.currentYearTotal).toBe(10000);
    expect(item.remaining).toBe(190000);
  }
});

test("正常系: 支出なし・年予算なしのカテゴリは結果に含まれない", () => {
  vi.mocked(useLiveQuery).mockReturnValue({
    paymentFiles: [
      {
        fileName: "test.csv",
        payments: [
          {
            name: "スーパー",
            date: makeDate(CURRENT_YEAR, "01"),
            price: 5000,
            count: 1,
          },
        ],
      },
    ],
    categories: [
      { id: "cat-1", name: "食費", order: 0, annualBudget: 120000 },
      { id: "cat-2", name: "未使用カテゴリ", order: 1 },
    ],
    allRules: [
      { id: "rule-1", categoryId: "cat-1", pattern: "スーパー", order: 0 },
    ],
  });

  const { result } = renderHook(() => useAnnualBudgetSummary());

  expect(result.current.status).toBe("completed");
  if (result.current.status === "completed") {
    expect(result.current.items).toHaveLength(1);
    expect(result.current.items[0].categoryName).toBe("食費");
  }
});

test("正常系: 支出が年予算を超えた場合、remainingが負になる", () => {
  vi.mocked(useLiveQuery).mockReturnValue({
    paymentFiles: [
      {
        fileName: "test.csv",
        payments: [
          {
            name: "旅行",
            date: makeDate(CURRENT_YEAR, "05"),
            price: 80000,
            count: 1,
          },
        ],
      },
    ],
    categories: [
      { id: "cat-1", name: "旅行費", order: 0, annualBudget: 50000 },
    ],
    allRules: [
      { id: "rule-1", categoryId: "cat-1", pattern: "旅行", order: 0 },
    ],
  });

  const { result } = renderHook(() => useAnnualBudgetSummary());

  expect(result.current.status).toBe("completed");
  if (result.current.status === "completed") {
    const item = result.current.items[0];
    expect(item.currentYearTotal).toBe(80000);
    expect(item.remaining).toBe(-30000);
  }
});

test("正常系: 月単位ではみ出ていても年累計ベースで正しく計算される", () => {
  vi.mocked(useLiveQuery).mockReturnValue({
    paymentFiles: [
      {
        fileName: "test.csv",
        payments: [
          // 1月は月予算（1万円）を超えているが、年間では余裕あり
          {
            name: "ライブ",
            date: makeDate(CURRENT_YEAR, "01"),
            price: 30000,
            count: 1,
          },
          {
            name: "ライブ",
            date: makeDate(CURRENT_YEAR, "02"),
            price: 5000,
            count: 1,
          },
        ],
      },
    ],
    categories: [
      { id: "cat-1", name: "娯楽費", order: 0, annualBudget: 120000 },
    ],
    allRules: [
      { id: "rule-1", categoryId: "cat-1", pattern: "ライブ", order: 0 },
    ],
  });

  const { result } = renderHook(() => useAnnualBudgetSummary());

  expect(result.current.status).toBe("completed");
  if (result.current.status === "completed") {
    const item = result.current.items[0];
    expect(item.currentYearTotal).toBe(35000);
    expect(item.remaining).toBe(85000);
  }
});

test("正常系: 年予算あり・今年の支出ゼロのカテゴリも表示される", () => {
  vi.mocked(useLiveQuery).mockReturnValue({
    paymentFiles: [],
    categories: [
      { id: "cat-1", name: "貯蓄目標", order: 0, annualBudget: 500000 },
    ],
    allRules: [],
  });

  const { result } = renderHook(() => useAnnualBudgetSummary());

  expect(result.current.status).toBe("completed");
  if (result.current.status === "completed") {
    expect(result.current.items).toHaveLength(1);
    const item = result.current.items[0];
    expect(item.currentYearTotal).toBe(0);
    expect(item.remaining).toBe(500000);
    expect(item.isFallback).toBe(false);
  }
});
