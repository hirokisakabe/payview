import { beforeEach, expect, test, vi } from "vitest";
import { renderHook } from "@testing-library/react";
import { usePaymentsBreakdown } from "./usePaymentsBreakdown";

vi.mock("./usePayments");

import { usePayments } from "./usePayments";

beforeEach(() => {
  vi.clearAllMocks();
});

test("正常系: ローディング中はstatus=loadingを返す", () => {
  vi.mocked(usePayments).mockReturnValue({ status: "loading" });

  const { result } = renderHook(() =>
    usePaymentsBreakdown({ fileName: "test.csv" }),
  );

  expect(result.current).toEqual({ status: "loading" });
});

test("正常系: 同一名の支払いが合算される", () => {
  vi.mocked(usePayments).mockReturnValue({
    status: "completed",
    payments: [
      { date: "2023-01-01", name: "食費", price: 1000, count: 1 },
      { date: "2023-01-02", name: "食費", price: 500, count: 1 },
      { date: "2023-01-03", name: "交通費", price: 300, count: 1 },
    ],
  });

  const { result } = renderHook(() =>
    usePaymentsBreakdown({ fileName: "test.csv" }),
  );

  expect(result.current.status).toBe("completed");
  if (result.current.status === "completed") {
    const food = result.current.breakdown.find((b) => b.name === "食費");
    expect(food?.total).toBe(1500);
  }
});

test("正常系: breakdownはtotalの降順でソートされる", () => {
  vi.mocked(usePayments).mockReturnValue({
    status: "completed",
    payments: [
      { date: "2023-01-01", name: "小額", price: 100, count: 1 },
      { date: "2023-01-02", name: "中額", price: 500, count: 1 },
      { date: "2023-01-03", name: "高額", price: 1000, count: 1 },
    ],
  });

  const { result } = renderHook(() =>
    usePaymentsBreakdown({ fileName: "test.csv" }),
  );

  expect(result.current.status).toBe("completed");
  if (result.current.status === "completed") {
    expect(result.current.breakdown[0].name).toBe("高額");
    expect(result.current.breakdown[1].name).toBe("中額");
    expect(result.current.breakdown[2].name).toBe("小額");
  }
});

test("正常系: 空の支払いリストの場合、空のbreakdownを返す", () => {
  vi.mocked(usePayments).mockReturnValue({
    status: "completed",
    payments: [],
  });

  const { result } = renderHook(() =>
    usePaymentsBreakdown({ fileName: "test.csv" }),
  );

  expect(result.current).toEqual({ status: "completed", breakdown: [] });
});
