import { beforeEach, expect, test, vi } from "vitest";
import { updateCategory } from "./updateCategory";

vi.mock("../db", () => ({
  db: {
    categories: {
      get: vi.fn(),
      put: vi.fn(),
    },
  },
}));

import { db } from "../db";

beforeEach(() => {
  vi.clearAllMocks();
});

test("正常系: カテゴリ名が更新される", async () => {
  vi.mocked(db.categories.get).mockResolvedValue({
    id: "category-1",
    name: "旧名前",
    order: 0,
  } as never);
  vi.mocked(db.categories.put).mockResolvedValue("category-1" as never);

  await updateCategory({ id: "category-1", name: "新しい名前" });

  expect(db.categories.put).toHaveBeenCalledWith({
    id: "category-1",
    name: "新しい名前",
    order: 0,
  });
});

test("正常系: 月予算が設定される", async () => {
  vi.mocked(db.categories.get).mockResolvedValue({
    id: "category-1",
    name: "食費",
    order: 0,
  } as never);
  vi.mocked(db.categories.put).mockResolvedValue("category-1" as never);

  await updateCategory({
    id: "category-1",
    name: "食費",
    monthlyBudget: 120000,
  });

  expect(db.categories.put).toHaveBeenCalledWith({
    id: "category-1",
    name: "食費",
    order: 0,
    monthlyBudget: 120000,
  });
});

test("正常系: 月予算が削除される（undefinedを渡す）", async () => {
  vi.mocked(db.categories.get).mockResolvedValue({
    id: "category-1",
    name: "食費",
    order: 0,
    monthlyBudget: 120000,
  } as never);
  vi.mocked(db.categories.put).mockResolvedValue("category-1" as never);

  await updateCategory({ id: "category-1", name: "食費" });

  expect(db.categories.put).toHaveBeenCalledWith({
    id: "category-1",
    name: "食費",
    order: 0,
  });
});

test("正常系: 既存の月予算が別の値に更新される", async () => {
  vi.mocked(db.categories.get).mockResolvedValue({
    id: "category-1",
    name: "食費",
    order: 0,
    monthlyBudget: 60000,
  } as never);
  vi.mocked(db.categories.put).mockResolvedValue("category-1" as never);

  await updateCategory({
    id: "category-1",
    name: "食費",
    monthlyBudget: 120000,
  });

  expect(db.categories.put).toHaveBeenCalledWith({
    id: "category-1",
    name: "食費",
    order: 0,
    monthlyBudget: 120000,
  });
});

test("正常系: カテゴリが存在しない場合は何もしない", async () => {
  vi.mocked(db.categories.get).mockResolvedValue(undefined as never);

  await updateCategory({ id: "not-exist", name: "名前" });

  expect(db.categories.put).not.toHaveBeenCalled();
});

test("異常系: DB操作でエラーが発生した場合", async () => {
  vi.mocked(db.categories.get).mockRejectedValue(
    new Error("DB Error") as never,
  );

  await expect(
    updateCategory({ id: "category-1", name: "エラー" }),
  ).rejects.toThrow("DB Error");
});
