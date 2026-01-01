import { beforeEach, expect, test, vi } from "vitest";
import { renderHook } from "@testing-library/react";
import { useTagRules } from "./useTagRules";

vi.mock("dexie-react-hooks", () => ({
  useLiveQuery: vi.fn(),
}));

import { useLiveQuery } from "dexie-react-hooks";

beforeEach(() => {
  vi.clearAllMocks();
});

test("正常系: ローディング中はstatus=loadingを返す", () => {
  vi.mocked(useLiveQuery).mockReturnValue(undefined);

  const { result } = renderHook(() => useTagRules({ tagId: "tag-1" }));

  expect(result.current).toEqual({ status: "loading" });
});

test("正常系: データ取得後はstatus=completedとrulesを返す", () => {
  const mockRules = [
    { id: "rule-1", tagId: "tag-1", pattern: "パターン1", order: 0 },
    { id: "rule-2", tagId: "tag-1", pattern: "パターン2", order: 1 },
  ];
  vi.mocked(useLiveQuery).mockReturnValue(mockRules);

  const { result } = renderHook(() => useTagRules({ tagId: "tag-1" }));

  expect(result.current).toEqual({ status: "completed", rules: mockRules });
});

test("正常系: ルールがない場合は空配列を返す", () => {
  vi.mocked(useLiveQuery).mockReturnValue([]);

  const { result } = renderHook(() => useTagRules({ tagId: "tag-1" }));

  expect(result.current).toEqual({ status: "completed", rules: [] });
});
