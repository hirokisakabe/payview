import { beforeEach, expect, test, vi } from "vitest";
import { renderHook } from "@testing-library/react";
import { useFileNavigation } from "./useFileNavigation";

vi.mock("dexie-react-hooks", () => ({
  useLiveQuery: vi.fn(),
}));

import { useLiveQuery } from "dexie-react-hooks";

beforeEach(() => {
  vi.clearAllMocks();
});

test("ローディング中はstatus=loadingを返す", () => {
  vi.mocked(useLiveQuery).mockReturnValue(undefined);

  const { result } = renderHook(() => useFileNavigation("test.csv"));

  expect(result.current.status).toBe("loading");
  expect(result.current.hasPrev).toBe(false);
  expect(result.current.hasNext).toBe(false);
});

test("ファイル一覧がソートされる", () => {
  vi.mocked(useLiveQuery).mockReturnValue([
    { fileName: "202505.csv", payments: [] },
    { fileName: "202503.csv", payments: [] },
    { fileName: "202504.csv", payments: [] },
  ]);

  const { result } = renderHook(() => useFileNavigation("202504.csv"));

  expect(result.current.files).toEqual([
    "202503.csv",
    "202504.csv",
    "202505.csv",
  ]);
});

test("中間のファイルでは前後両方に移動可能", () => {
  vi.mocked(useLiveQuery).mockReturnValue([
    { fileName: "202503.csv", payments: [] },
    { fileName: "202504.csv", payments: [] },
    { fileName: "202505.csv", payments: [] },
  ]);

  const { result } = renderHook(() => useFileNavigation("202504.csv"));

  expect(result.current.status).toBe("ready");
  expect(result.current.hasPrev).toBe(true);
  expect(result.current.hasNext).toBe(true);
  expect(result.current.prevFile).toBe("202503.csv");
  expect(result.current.nextFile).toBe("202505.csv");
});

test("最初のファイルでは前へ移動不可", () => {
  vi.mocked(useLiveQuery).mockReturnValue([
    { fileName: "202503.csv", payments: [] },
    { fileName: "202504.csv", payments: [] },
  ]);

  const { result } = renderHook(() => useFileNavigation("202503.csv"));

  expect(result.current.hasPrev).toBe(false);
  expect(result.current.hasNext).toBe(true);
  expect(result.current.prevFile).toBeNull();
});

test("最後のファイルでは次へ移動不可", () => {
  vi.mocked(useLiveQuery).mockReturnValue([
    { fileName: "202503.csv", payments: [] },
    { fileName: "202504.csv", payments: [] },
  ]);

  const { result } = renderHook(() => useFileNavigation("202504.csv"));

  expect(result.current.hasPrev).toBe(true);
  expect(result.current.hasNext).toBe(false);
  expect(result.current.nextFile).toBeNull();
});

test("ファイルが1つだけの場合は前後どちらにも移動不可", () => {
  vi.mocked(useLiveQuery).mockReturnValue([
    { fileName: "202504.csv", payments: [] },
  ]);

  const { result } = renderHook(() => useFileNavigation("202504.csv"));

  expect(result.current.hasPrev).toBe(false);
  expect(result.current.hasNext).toBe(false);
});
