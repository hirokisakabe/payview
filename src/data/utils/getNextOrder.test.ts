import { beforeEach, expect, test, vi } from "vitest";
import { getNextOrder } from "./getNextOrder";

vi.mock("../db", () => ({
  db: {
    categories: {
      orderBy: vi.fn(),
    },
    categoryRules: {
      where: vi.fn(),
    },
  },
}));

import { db } from "../db";

beforeEach(() => {
  vi.clearAllMocks();
});

test("正常系: categories - カテゴリが存在しない場合、0を返す", async () => {
  vi.mocked(db.categories.orderBy).mockReturnValue({
    last: vi.fn().mockResolvedValue(undefined),
  } as never);

  const result = await getNextOrder("categories");

  expect(result).toBe(0);
  expect(db.categories.orderBy).toHaveBeenCalledWith("order");
});

test("正常系: categories - 既存カテゴリがある場合、maxOrder+1を返す", async () => {
  vi.mocked(db.categories.orderBy).mockReturnValue({
    last: vi
      .fn()
      .mockResolvedValue({ id: "category-1", name: "食費", order: 5 }),
  } as never);

  const result = await getNextOrder("categories");

  expect(result).toBe(6);
});

test("正常系: categoryRules - フィルタありでルールが存在しない場合、0を返す", async () => {
  vi.mocked(db.categoryRules.where).mockReturnValue({
    equals: vi.fn().mockReturnValue({
      sortBy: vi.fn().mockResolvedValue([]),
    }),
  } as never);

  const result = await getNextOrder("categoryRules", {
    where: "categoryId",
    equals: "category-1",
  });

  expect(result).toBe(0);
  expect(db.categoryRules.where).toHaveBeenCalledWith("categoryId");
});

test("正常系: categoryRules - フィルタありで既存ルールがある場合、maxOrder+1を返す", async () => {
  vi.mocked(db.categoryRules.where).mockReturnValue({
    equals: vi.fn().mockReturnValue({
      sortBy: vi.fn().mockResolvedValue([
        {
          id: "rule-1",
          categoryId: "category-1",
          pattern: "パターン1",
          order: 2,
        },
        {
          id: "rule-2",
          categoryId: "category-1",
          pattern: "パターン2",
          order: 5,
        },
      ]),
    }),
  } as never);

  const result = await getNextOrder("categoryRules", {
    where: "categoryId",
    equals: "category-1",
  });

  expect(result).toBe(6);
});

test("正常系: categoryRules - フィルタなしの場合、0を返す", async () => {
  const result = await getNextOrder("categoryRules");

  expect(result).toBe(0);
  expect(db.categoryRules.where).not.toHaveBeenCalled();
});
