import { beforeEach, expect, test, vi } from "vitest";
import { renderHook } from "@testing-library/react";
import { usePaymentsByCategory } from "./usePaymentsByCategory";

vi.mock("./usePayments");
vi.mock("../categories/useAllCategoryRules");

import { usePayments } from "./usePayments";
import { useAllCategoryRules } from "../categories/useAllCategoryRules";

beforeEach(() => {
  vi.clearAllMocks();
});

test("正常系: paymentsがローディング中はstatus=loadingを返す", () => {
  vi.mocked(usePayments).mockReturnValue({ status: "loading" });
  vi.mocked(useAllCategoryRules).mockReturnValue({
    status: "completed",
    categoriesWithRules: [],
  });

  const { result } = renderHook(() =>
    usePaymentsByCategory({ fileName: "test.csv" }),
  );

  expect(result.current).toEqual({ status: "loading" });
});

test("正常系: categoriesResultがローディング中はstatus=loadingを返す", () => {
  vi.mocked(usePayments).mockReturnValue({
    status: "completed",
    payments: [],
  });
  vi.mocked(useAllCategoryRules).mockReturnValue({ status: "loading" });

  const { result } = renderHook(() =>
    usePaymentsByCategory({ fileName: "test.csv" }),
  );

  expect(result.current).toEqual({ status: "loading" });
});

test("正常系: 支払い名がパターンに一致する場合、対応するカテゴリに集計される", () => {
  vi.mocked(usePayments).mockReturnValue({
    status: "completed",
    payments: [
      { date: "2023-01-01", name: "スーパーマーケット", price: 1000, count: 1 },
      { date: "2023-01-02", name: "コンビニエンス", price: 500, count: 1 },
    ],
  });
  vi.mocked(useAllCategoryRules).mockReturnValue({
    status: "completed",
    categoriesWithRules: [
      {
        id: "category-1",
        name: "食費",
        order: 0,
        rules: [
          {
            id: "rule-1",
            categoryId: "category-1",
            pattern: "スーパー",
            order: 0,
          },
          {
            id: "rule-2",
            categoryId: "category-1",
            pattern: "コンビニ",
            order: 1,
          },
        ],
      },
    ],
  });

  const { result } = renderHook(() =>
    usePaymentsByCategory({ fileName: "test.csv" }),
  );

  expect(result.current.status).toBe("completed");
  if (result.current.status === "completed") {
    expect(result.current.breakdown).toHaveLength(1);
    expect(result.current.breakdown[0].category?.name).toBe("食費");
    expect(result.current.breakdown[0].total).toBe(1500);
    expect(result.current.breakdown[0].count).toBe(2);
  }
});

test("正常系: 複数ルールがある場合、最初にマッチしたカテゴリに割り当てられる", () => {
  vi.mocked(usePayments).mockReturnValue({
    status: "completed",
    payments: [
      { date: "2023-01-01", name: "スーパー食品", price: 1000, count: 1 },
    ],
  });
  vi.mocked(useAllCategoryRules).mockReturnValue({
    status: "completed",
    categoriesWithRules: [
      {
        id: "category-1",
        name: "食費",
        order: 0,
        rules: [
          {
            id: "rule-1",
            categoryId: "category-1",
            pattern: "スーパー",
            order: 0,
          },
        ],
      },
      {
        id: "category-2",
        name: "日用品",
        order: 1,
        rules: [
          { id: "rule-2", categoryId: "category-2", pattern: "食品", order: 0 },
        ],
      },
    ],
  });

  const { result } = renderHook(() =>
    usePaymentsByCategory({ fileName: "test.csv" }),
  );

  expect(result.current.status).toBe("completed");
  if (result.current.status === "completed") {
    expect(result.current.breakdown).toHaveLength(1);
    expect(result.current.breakdown[0].category?.name).toBe("食費");
  }
});

test("正常系: どのパターンにもマッチしない場合、未分類として集計される", () => {
  vi.mocked(usePayments).mockReturnValue({
    status: "completed",
    payments: [
      { date: "2023-01-01", name: "謎の支払い", price: 1000, count: 1 },
    ],
  });
  vi.mocked(useAllCategoryRules).mockReturnValue({
    status: "completed",
    categoriesWithRules: [
      {
        id: "category-1",
        name: "食費",
        order: 0,
        rules: [
          {
            id: "rule-1",
            categoryId: "category-1",
            pattern: "スーパー",
            order: 0,
          },
        ],
      },
    ],
  });

  const { result } = renderHook(() =>
    usePaymentsByCategory({ fileName: "test.csv" }),
  );

  expect(result.current.status).toBe("completed");
  if (result.current.status === "completed") {
    expect(result.current.breakdown).toHaveLength(1);
    expect(result.current.breakdown[0].category).toBeNull();
    expect(result.current.breakdown[0].name).toBe("謎の支払い");
    expect(result.current.breakdown[0].payments).toHaveLength(1);
    expect(result.current.breakdown[0].payments[0]).toEqual({
      name: "謎の支払い",
      date: "2023-01-01",
      price: 1000,
    });
  }
});

test("正常系: 同一カテゴリの支払いが合算され、個別支払いがpaymentsに含まれる", () => {
  vi.mocked(usePayments).mockReturnValue({
    status: "completed",
    payments: [
      { date: "2023-01-01", name: "スーパーA", price: 1000, count: 1 },
      { date: "2023-01-02", name: "スーパーB", price: 2000, count: 1 },
    ],
  });
  vi.mocked(useAllCategoryRules).mockReturnValue({
    status: "completed",
    categoriesWithRules: [
      {
        id: "category-1",
        name: "食費",
        order: 0,
        rules: [
          {
            id: "rule-1",
            categoryId: "category-1",
            pattern: "スーパー",
            order: 0,
          },
        ],
      },
    ],
  });

  const { result } = renderHook(() =>
    usePaymentsByCategory({ fileName: "test.csv" }),
  );

  expect(result.current.status).toBe("completed");
  if (result.current.status === "completed") {
    expect(result.current.breakdown[0].total).toBe(3000);
    expect(result.current.breakdown[0].count).toBe(2);
    expect(result.current.breakdown[0].payments).toHaveLength(2);
    expect(result.current.breakdown[0].payments[0]).toEqual({
      name: "スーパーA",
      date: "2023-01-01",
      price: 1000,
    });
    expect(result.current.breakdown[0].payments[1]).toEqual({
      name: "スーパーB",
      date: "2023-01-02",
      price: 2000,
    });
  }
});

test("正常系: breakdownはtotalの降順でソートされる", () => {
  vi.mocked(usePayments).mockReturnValue({
    status: "completed",
    payments: [
      { date: "2023-01-01", name: "スーパー", price: 500, count: 1 },
      { date: "2023-01-02", name: "電車", price: 1000, count: 1 },
    ],
  });
  vi.mocked(useAllCategoryRules).mockReturnValue({
    status: "completed",
    categoriesWithRules: [
      {
        id: "category-1",
        name: "食費",
        order: 0,
        rules: [
          {
            id: "rule-1",
            categoryId: "category-1",
            pattern: "スーパー",
            order: 0,
          },
        ],
      },
      {
        id: "category-2",
        name: "交通費",
        order: 1,
        rules: [
          { id: "rule-2", categoryId: "category-2", pattern: "電車", order: 0 },
        ],
      },
    ],
  });

  const { result } = renderHook(() =>
    usePaymentsByCategory({ fileName: "test.csv" }),
  );

  expect(result.current.status).toBe("completed");
  if (result.current.status === "completed") {
    expect(result.current.breakdown[0].category?.name).toBe("交通費");
    expect(result.current.breakdown[1].category?.name).toBe("食費");
  }
});

test("正常系: カテゴリはあるがルールがない場合、全て未分類になる", () => {
  vi.mocked(usePayments).mockReturnValue({
    status: "completed",
    payments: [{ date: "2023-01-01", name: "スーパー", price: 1000, count: 1 }],
  });
  vi.mocked(useAllCategoryRules).mockReturnValue({
    status: "completed",
    categoriesWithRules: [
      {
        id: "category-1",
        name: "食費",
        order: 0,
        rules: [],
      },
    ],
  });

  const { result } = renderHook(() =>
    usePaymentsByCategory({ fileName: "test.csv" }),
  );

  expect(result.current.status).toBe("completed");
  if (result.current.status === "completed") {
    expect(result.current.breakdown).toHaveLength(1);
    expect(result.current.breakdown[0].category).toBeNull();
  }
});

test("正常系: 支払いがない場合、空のbreakdownを返す", () => {
  vi.mocked(usePayments).mockReturnValue({
    status: "completed",
    payments: [],
  });
  vi.mocked(useAllCategoryRules).mockReturnValue({
    status: "completed",
    categoriesWithRules: [
      {
        id: "category-1",
        name: "食費",
        order: 0,
        rules: [
          {
            id: "rule-1",
            categoryId: "category-1",
            pattern: "スーパー",
            order: 0,
          },
        ],
      },
    ],
  });

  const { result } = renderHook(() =>
    usePaymentsByCategory({ fileName: "test.csv" }),
  );

  expect(result.current).toEqual({ status: "completed", breakdown: [] });
});
