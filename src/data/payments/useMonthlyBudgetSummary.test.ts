import { beforeEach, expect, test, vi } from "vitest";
import { renderHook } from "@testing-library/react";
import { useMonthlyBudgetSummary } from "./useMonthlyBudgetSummary";

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

  const { result } = renderHook(() =>
    useMonthlyBudgetSummary({ fileName: "2024-01.csv" }),
  );

  expect(result.current.status).toBe("loading");
});

test("正常系: 月予算が設定されたカテゴリは設定値とfileTotalを返す", () => {
  vi.mocked(useLiveQuery).mockReturnValue({
    paymentFile: {
      fileName: "2024-01.csv",
      payments: [
        {
          name: "スーパー",
          date: makeDate(CURRENT_YEAR, "01"),
          price: 5000,
          count: 1,
        },
        {
          name: "スーパー",
          date: makeDate(CURRENT_YEAR, "01"),
          price: 3000,
          count: 1,
        },
      ],
    },
    categories: [{ id: "cat-1", name: "食費", order: 0, monthlyBudget: 20000 }],
    allRules: [
      { id: "rule-1", categoryId: "cat-1", pattern: "スーパー", order: 0 },
    ],
  });

  const { result } = renderHook(() =>
    useMonthlyBudgetSummary({ fileName: "2024-01.csv" }),
  );

  expect(result.current.status).toBe("completed");
  if (result.current.status === "completed") {
    expect(result.current.items).toHaveLength(1);
    const item = result.current.items[0];
    expect(item.categoryName).toBe("食費");
    expect(item.monthlyBudget).toBe(20000);
    expect(item.fileTotal).toBe(8000);
    expect(item.remaining).toBe(12000);
  }
});

test("正常系: 月予算未設定の場合、monthlyBudgetがundefinedでremainingもundefined", () => {
  vi.mocked(useLiveQuery).mockReturnValue({
    paymentFile: {
      fileName: "2024-01.csv",
      payments: [
        {
          name: "電車代",
          date: makeDate(CURRENT_YEAR, "01"),
          price: 3000,
          count: 1,
        },
      ],
    },
    categories: [{ id: "cat-1", name: "交通費", order: 0 }],
    allRules: [
      { id: "rule-1", categoryId: "cat-1", pattern: "電車", order: 0 },
    ],
  });

  const { result } = renderHook(() =>
    useMonthlyBudgetSummary({ fileName: "2024-01.csv" }),
  );

  expect(result.current.status).toBe("completed");
  if (result.current.status === "completed") {
    expect(result.current.items).toHaveLength(1);
    const item = result.current.items[0];
    expect(item.monthlyBudget).toBeUndefined();
    expect(item.fileTotal).toBe(3000);
    expect(item.remaining).toBeUndefined();
  }
});

test("正常系: 支出なし・月予算なしのカテゴリは結果に含まれない", () => {
  vi.mocked(useLiveQuery).mockReturnValue({
    paymentFile: {
      fileName: "2024-01.csv",
      payments: [
        {
          name: "スーパー",
          date: makeDate(CURRENT_YEAR, "01"),
          price: 5000,
          count: 1,
        },
      ],
    },
    categories: [
      { id: "cat-1", name: "食費", order: 0, monthlyBudget: 20000 },
      { id: "cat-2", name: "未使用カテゴリ", order: 1 },
    ],
    allRules: [
      { id: "rule-1", categoryId: "cat-1", pattern: "スーパー", order: 0 },
    ],
  });

  const { result } = renderHook(() =>
    useMonthlyBudgetSummary({ fileName: "2024-01.csv" }),
  );

  expect(result.current.status).toBe("completed");
  if (result.current.status === "completed") {
    expect(result.current.items).toHaveLength(1);
    expect(result.current.items[0].categoryName).toBe("食費");
  }
});

test("正常系: 支出が月予算を超えた場合、remainingが負になる", () => {
  vi.mocked(useLiveQuery).mockReturnValue({
    paymentFile: {
      fileName: "2024-01.csv",
      payments: [
        {
          name: "旅行",
          date: makeDate(CURRENT_YEAR, "01"),
          price: 80000,
          count: 1,
        },
      ],
    },
    categories: [
      { id: "cat-1", name: "旅行費", order: 0, monthlyBudget: 50000 },
    ],
    allRules: [
      { id: "rule-1", categoryId: "cat-1", pattern: "旅行", order: 0 },
    ],
  });

  const { result } = renderHook(() =>
    useMonthlyBudgetSummary({ fileName: "2024-01.csv" }),
  );

  expect(result.current.status).toBe("completed");
  if (result.current.status === "completed") {
    const item = result.current.items[0];
    expect(item.fileTotal).toBe(80000);
    expect(item.remaining).toBe(-30000);
  }
});

test("正常系: 月予算あり・ファイル内支出ゼロのカテゴリも表示される", () => {
  vi.mocked(useLiveQuery).mockReturnValue({
    paymentFile: { fileName: "2024-01.csv", payments: [] },
    categories: [
      { id: "cat-1", name: "貯蓄目標", order: 0, monthlyBudget: 50000 },
    ],
    allRules: [],
  });

  const { result } = renderHook(() =>
    useMonthlyBudgetSummary({ fileName: "2024-01.csv" }),
  );

  expect(result.current.status).toBe("completed");
  if (result.current.status === "completed") {
    expect(result.current.items).toHaveLength(1);
    const item = result.current.items[0];
    expect(item.fileTotal).toBe(0);
    expect(item.remaining).toBe(50000);
    expect(item.monthlyBudget).toBe(50000);
  }
});

test("正常系: 指定されたファイルが存在しない場合、空の結果を返す", () => {
  vi.mocked(useLiveQuery).mockReturnValue({
    paymentFile: undefined,
    categories: [{ id: "cat-1", name: "食費", order: 0, monthlyBudget: 20000 }],
    allRules: [],
  });

  const { result } = renderHook(() =>
    useMonthlyBudgetSummary({ fileName: "not-found.csv" }),
  );

  expect(result.current.status).toBe("completed");
  if (result.current.status === "completed") {
    expect(result.current.items).toHaveLength(0);
  }
});
