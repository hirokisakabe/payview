import { beforeEach, expect, test, vi } from "vitest";
import { getNextOrder } from "./getNextOrder";

vi.mock("../db", () => ({
  db: {
    tags: {
      orderBy: vi.fn(),
    },
    tagRules: {
      where: vi.fn(),
    },
  },
}));

import { db } from "../db";

beforeEach(() => {
  vi.clearAllMocks();
});

test("正常系: tags - タグが存在しない場合、0を返す", async () => {
  vi.mocked(db.tags.orderBy).mockReturnValue({
    last: vi.fn().mockResolvedValue(undefined),
  } as never);

  const result = await getNextOrder("tags");

  expect(result).toBe(0);
  expect(db.tags.orderBy).toHaveBeenCalledWith("order");
});

test("正常系: tags - 既存タグがある場合、maxOrder+1を返す", async () => {
  vi.mocked(db.tags.orderBy).mockReturnValue({
    last: vi.fn().mockResolvedValue({ id: "tag-1", name: "食費", order: 5 }),
  } as never);

  const result = await getNextOrder("tags");

  expect(result).toBe(6);
});

test("正常系: tagRules - フィルタありでルールが存在しない場合、0を返す", async () => {
  vi.mocked(db.tagRules.where).mockReturnValue({
    equals: vi.fn().mockReturnValue({
      sortBy: vi.fn().mockResolvedValue([]),
    }),
  } as never);

  const result = await getNextOrder("tagRules", {
    where: "tagId",
    equals: "tag-1",
  });

  expect(result).toBe(0);
  expect(db.tagRules.where).toHaveBeenCalledWith("tagId");
});

test("正常系: tagRules - フィルタありで既存ルールがある場合、maxOrder+1を返す", async () => {
  vi.mocked(db.tagRules.where).mockReturnValue({
    equals: vi.fn().mockReturnValue({
      sortBy: vi.fn().mockResolvedValue([
        { id: "rule-1", tagId: "tag-1", pattern: "パターン1", order: 2 },
        { id: "rule-2", tagId: "tag-1", pattern: "パターン2", order: 5 },
      ]),
    }),
  } as never);

  const result = await getNextOrder("tagRules", {
    where: "tagId",
    equals: "tag-1",
  });

  expect(result).toBe(6);
});

test("正常系: tagRules - フィルタなしの場合、0を返す", async () => {
  const result = await getNextOrder("tagRules");

  expect(result).toBe(0);
  expect(db.tagRules.where).not.toHaveBeenCalled();
});
