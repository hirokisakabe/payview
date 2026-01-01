import { beforeEach, expect, test, vi } from "vitest";
import { renderHook } from "@testing-library/react";
import { useAllTagRules } from "./useAllTagRules";

vi.mock("dexie-react-hooks", () => ({
  useLiveQuery: vi.fn(),
}));

import { useLiveQuery } from "dexie-react-hooks";

beforeEach(() => {
  vi.clearAllMocks();
});

test("正常系: ローディング中はstatus=loadingを返す", () => {
  vi.mocked(useLiveQuery).mockReturnValue(undefined);

  const { result } = renderHook(() => useAllTagRules());

  expect(result.current).toEqual({ status: "loading" });
});

test("正常系: tagsWithRulesが正しく返される", () => {
  const mockTagsWithRules = [
    {
      id: "tag-1",
      name: "食費",
      order: 0,
      rules: [
        { id: "rule-1", tagId: "tag-1", pattern: "スーパー", order: 0 },
        { id: "rule-2", tagId: "tag-1", pattern: "コンビニ", order: 1 },
      ],
    },
    {
      id: "tag-2",
      name: "交通費",
      order: 1,
      rules: [{ id: "rule-3", tagId: "tag-2", pattern: "電車", order: 0 }],
    },
  ];
  vi.mocked(useLiveQuery).mockReturnValue(mockTagsWithRules);

  const { result } = renderHook(() => useAllTagRules());

  expect(result.current).toEqual({
    status: "completed",
    tagsWithRules: mockTagsWithRules,
  });
});

test("正常系: ルールがないタグはrules=[]で返される", () => {
  const mockTagsWithRules = [
    {
      id: "tag-1",
      name: "食費",
      order: 0,
      rules: [],
    },
  ];
  vi.mocked(useLiveQuery).mockReturnValue(mockTagsWithRules);

  const { result } = renderHook(() => useAllTagRules());

  expect(result.current.status).toBe("completed");
  if (result.current.status === "completed") {
    expect(result.current.tagsWithRules[0].rules).toEqual([]);
  }
});

test("正常系: タグがない場合は空配列を返す", () => {
  vi.mocked(useLiveQuery).mockReturnValue([]);

  const { result } = renderHook(() => useAllTagRules());

  expect(result.current).toEqual({ status: "completed", tagsWithRules: [] });
});
