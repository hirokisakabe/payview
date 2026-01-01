import { beforeEach, expect, test, vi } from "vitest";
import { renderHook } from "@testing-library/react";
import { useCategories } from "./useCategories";

vi.mock("dexie-react-hooks", () => ({
  useLiveQuery: vi.fn(),
}));

import { useLiveQuery } from "dexie-react-hooks";

beforeEach(() => {
  vi.clearAllMocks();
});

test("正常系: ローディング中はstatus=loadingを返す", () => {
  vi.mocked(useLiveQuery).mockReturnValue(undefined);

  const { result } = renderHook(() => useCategories());

  expect(result.current).toEqual({ status: "loading" });
});

test("正常系: データ取得後はstatus=completedとcategoriesを返す", () => {
  const mockCategories = [
    { id: "category-1", name: "食費", order: 0 },
    { id: "category-2", name: "交通費", order: 1 },
  ];
  vi.mocked(useLiveQuery).mockReturnValue(mockCategories);

  const { result } = renderHook(() => useCategories());

  expect(result.current).toEqual({
    status: "completed",
    categories: mockCategories,
  });
});

test("正常系: 空配列の場合もstatus=completedを返す", () => {
  vi.mocked(useLiveQuery).mockReturnValue([]);

  const { result } = renderHook(() => useCategories());

  expect(result.current).toEqual({ status: "completed", categories: [] });
});
