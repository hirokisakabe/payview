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

test("正常系: どのパターンにもマッチしない場合、未分類として1つにまとめて集計される", () => {
  vi.mocked(usePayments).mockReturnValue({
    status: "completed",
    payments: [
      { date: "2023-01-01", name: "謎の支払い", price: 1000, count: 1 },
      { date: "2023-01-02", name: "不明な支払い", price: 2000, count: 1 },
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
    expect(result.current.breakdown[0].total).toBe(3000);
    expect(result.current.breakdown[0].count).toBe(2);
    expect(result.current.breakdown[0].payments).toHaveLength(2);
    expect(result.current.breakdown[0].subBreakdown).toHaveLength(2);
    expect(result.current.breakdown[0].subBreakdown![0]).toEqual({
      name: "不明な支払い",
      total: 2000,
      count: 1,
      payments: [{ name: "不明な支払い", date: "2023-01-02", price: 2000 }],
    });
    expect(result.current.breakdown[0].subBreakdown![1]).toEqual({
      name: "謎の支払い",
      total: 1000,
      count: 1,
      payments: [{ name: "謎の支払い", date: "2023-01-01", price: 1000 }],
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

test("正常系: カテゴリはあるがルールがない場合、全て未分類にまとめられる", () => {
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
    expect(result.current.breakdown[0].total).toBe(1000);
    expect(result.current.breakdown[0].subBreakdown).toHaveLength(1);
    expect(result.current.breakdown[0].subBreakdown![0].name).toBe("スーパー");
  }
});

test("正常系: スペースを含むパターンで支払い名にマッチする", () => {
  vi.mocked(usePayments).mockReturnValue({
    status: "completed",
    payments: [
      { date: "2023-01-01", name: "AMAZON CO JP", price: 3000, count: 1 },
      { date: "2023-01-02", name: "AMAZONPRIME", price: 500, count: 1 },
    ],
  });
  vi.mocked(useAllCategoryRules).mockReturnValue({
    status: "completed",
    categoriesWithRules: [
      {
        id: "category-1",
        name: "ショッピング",
        order: 0,
        rules: [
          {
            id: "rule-1",
            categoryId: "category-1",
            pattern: "AMAZON CO",
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
    // "AMAZON CO" (スペース含む) は "AMAZON CO JP" にマッチするが "AMAZONPRIME" にはマッチしない
    expect(result.current.breakdown).toHaveLength(2);
    const categorized = result.current.breakdown.find(
      (b) => b.category !== null,
    );
    const uncategorized = result.current.breakdown.find(
      (b) => b.category === null,
    );
    expect(categorized?.category?.name).toBe("ショッピング");
    expect(categorized?.total).toBe(3000);
    expect(categorized?.count).toBe(1);
    expect(uncategorized?.total).toBe(500);
    expect(uncategorized?.subBreakdown).toHaveLength(1);
    expect(uncategorized?.subBreakdown![0].name).toBe("AMAZONPRIME");
  }
});

test("正常系: 未分類は金額に関わらず常にbreakdownの最終行に表示される", () => {
  vi.mocked(usePayments).mockReturnValue({
    status: "completed",
    payments: [
      { date: "2023-01-01", name: "スーパー", price: 500, count: 1 },
      { date: "2023-01-02", name: "電車", price: 300, count: 1 },
      { date: "2023-01-03", name: "謎の支払い", price: 10000, count: 1 },
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
    expect(result.current.breakdown).toHaveLength(3);
    // 分類済みカテゴリは金額降順
    expect(result.current.breakdown[0].category?.name).toBe("食費");
    expect(result.current.breakdown[0].total).toBe(500);
    expect(result.current.breakdown[1].category?.name).toBe("交通費");
    expect(result.current.breakdown[1].total).toBe(300);
    // 未分類は金額が最大でも最終行
    expect(result.current.breakdown[2].category).toBeNull();
    expect(result.current.breakdown[2].total).toBe(10000);
  }
});

test("正常系: 全角スペースと半角スペースが正規化されてマッチする", () => {
  vi.mocked(usePayments).mockReturnValue({
    status: "completed",
    payments: [
      // 半角スペース×2
      {
        date: "2023-01-01",
        name: "ＡＢＣＤ  ＳＨＯＰ",
        price: 3000,
        count: 1,
      },
    ],
  });
  vi.mocked(useAllCategoryRules).mockReturnValue({
    status: "completed",
    categoriesWithRules: [
      {
        id: "category-1",
        name: "ショッピング",
        order: 0,
        rules: [
          {
            id: "rule-1",
            categoryId: "category-1",
            // 全角スペース×1
            pattern: "ＡＢＣＤ\u3000ＳＨＯＰ",
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
    expect(result.current.breakdown[0].category?.name).toBe("ショッピング");
    expect(result.current.breakdown[0].total).toBe(3000);
  }
});

test("正常系: 連続する半角スペースが正規化されてマッチする", () => {
  vi.mocked(usePayments).mockReturnValue({
    status: "completed",
    payments: [
      // 半角スペース×3
      { date: "2023-01-01", name: "SHOP   NAME", price: 2000, count: 1 },
    ],
  });
  vi.mocked(useAllCategoryRules).mockReturnValue({
    status: "completed",
    categoriesWithRules: [
      {
        id: "category-1",
        name: "ショッピング",
        order: 0,
        rules: [
          {
            id: "rule-1",
            categoryId: "category-1",
            // 半角スペース×1
            pattern: "SHOP NAME",
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
    expect(result.current.breakdown[0].category?.name).toBe("ショッピング");
    expect(result.current.breakdown[0].total).toBe(2000);
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
