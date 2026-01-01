import { beforeEach, expect, test, vi } from "vitest";
import { renderHook } from "@testing-library/react";
import { useAllCategoryRules } from "./useAllCategoryRules";

vi.mock("dexie-react-hooks", () => ({
  useLiveQuery: vi.fn(),
}));

import { useLiveQuery } from "dexie-react-hooks";

beforeEach(() => {
  vi.clearAllMocks();
});

test("正常系: ローディング中はstatus=loadingを返す", () => {
  vi.mocked(useLiveQuery).mockReturnValue(undefined);

  const { result } = renderHook(() => useAllCategoryRules());

  expect(result.current).toEqual({ status: "loading" });
});

test("正常系: categoriesWithRulesが正しく返される", () => {
  const mockCategoriesWithRules = [
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
    {
      id: "category-2",
      name: "交通費",
      order: 1,
      rules: [
        { id: "rule-3", categoryId: "category-2", pattern: "電車", order: 0 },
      ],
    },
  ];
  vi.mocked(useLiveQuery).mockReturnValue(mockCategoriesWithRules);

  const { result } = renderHook(() => useAllCategoryRules());

  expect(result.current).toEqual({
    status: "completed",
    categoriesWithRules: mockCategoriesWithRules,
  });
});

test("正常系: ルールがないカテゴリはrules=[]で返される", () => {
  const mockCategoriesWithRules = [
    {
      id: "category-1",
      name: "食費",
      order: 0,
      rules: [],
    },
  ];
  vi.mocked(useLiveQuery).mockReturnValue(mockCategoriesWithRules);

  const { result } = renderHook(() => useAllCategoryRules());

  expect(result.current.status).toBe("completed");
  if (result.current.status === "completed") {
    expect(result.current.categoriesWithRules[0].rules).toEqual([]);
  }
});

test("正常系: カテゴリがない場合は空配列を返す", () => {
  vi.mocked(useLiveQuery).mockReturnValue([]);

  const { result } = renderHook(() => useAllCategoryRules());

  expect(result.current).toEqual({
    status: "completed",
    categoriesWithRules: [],
  });
});
