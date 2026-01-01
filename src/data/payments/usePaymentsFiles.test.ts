import { beforeEach, expect, test, vi } from "vitest";
import { renderHook } from "@testing-library/react";
import { usePaymentsFiles } from "./usePaymentsFiles";

vi.mock("dexie-react-hooks", () => ({
  useLiveQuery: vi.fn(),
}));

import { useLiveQuery } from "dexie-react-hooks";

beforeEach(() => {
  vi.clearAllMocks();
});

test("正常系: ローディング中はundefinedを返す", () => {
  vi.mocked(useLiveQuery).mockReturnValue(undefined);

  const { result } = renderHook(() => usePaymentsFiles());

  expect(result.current).toBeUndefined();
});

test("正常系: 全ファイル一覧が取得される", () => {
  const mockFiles = [
    {
      fileName: "test1.csv",
      payments: [{ date: "2023-01-01", name: "食費", price: 1000, count: 1 }],
    },
    {
      fileName: "test2.csv",
      payments: [{ date: "2023-02-01", name: "交通費", price: 500, count: 2 }],
    },
  ];
  vi.mocked(useLiveQuery).mockReturnValue(mockFiles);

  const { result } = renderHook(() => usePaymentsFiles());

  expect(result.current).toEqual(mockFiles);
});

test("正常系: ファイルがない場合は空配列を返す", () => {
  vi.mocked(useLiveQuery).mockReturnValue([]);

  const { result } = renderHook(() => usePaymentsFiles());

  expect(result.current).toEqual([]);
});
