import { beforeEach, expect, test, vi } from "vitest";
import { renderHook } from "@testing-library/react";
import { usePayments } from "./usePayments";

vi.mock("dexie-react-hooks", () => ({
  useLiveQuery: vi.fn(),
}));

import { useLiveQuery } from "dexie-react-hooks";

beforeEach(() => {
  vi.clearAllMocks();
});

test("正常系: ローディング中はstatus=loadingを返す", () => {
  vi.mocked(useLiveQuery).mockReturnValue(undefined);

  const { result } = renderHook(() => usePayments({ fileName: "test.csv" }));

  expect(result.current).toEqual({ status: "loading" });
});

test("正常系: ファイルが見つからない場合もstatus=loadingを返す", () => {
  vi.mocked(useLiveQuery).mockReturnValue([]);

  const { result } = renderHook(() => usePayments({ fileName: "test.csv" }));

  expect(result.current).toEqual({ status: "loading" });
});

test("正常系: データ取得後はstatus=completedとpaymentsを返す", () => {
  const mockPayments = [
    { date: "2023-01-01", name: "食費", price: 1000, count: 1 },
    { date: "2023-01-02", name: "交通費", price: 500, count: 2 },
  ];
  vi.mocked(useLiveQuery).mockReturnValue([
    { fileName: "test.csv", payments: mockPayments },
  ]);

  const { result } = renderHook(() => usePayments({ fileName: "test.csv" }));

  expect(result.current).toEqual({
    status: "completed",
    payments: mockPayments,
  });
});
