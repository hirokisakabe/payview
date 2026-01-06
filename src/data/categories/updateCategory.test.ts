import { beforeEach, expect, test, vi } from "vitest";
import { updateCategory, UpdateCategoryError } from "./updateCategory";

vi.mock("../db", () => ({
  db: {
    categories: {
      update: vi.fn(),
    },
  },
}));

import { db } from "../db";

beforeEach(() => {
  vi.clearAllMocks();
});

test("正常系: カテゴリ名が更新される", async () => {
  vi.mocked(db.categories.update).mockResolvedValue(1 as never);

  await updateCategory({ id: "category-1", name: "新しい名前" });

  expect(db.categories.update).toHaveBeenCalledWith("category-1", {
    name: "新しい名前",
  });
});

test("異常系: DB操作でエラーが発生した場合", async () => {
  vi.mocked(db.categories.update).mockRejectedValue(
    new Error("DB Error") as never,
  );

  await expect(
    updateCategory({ id: "category-1", name: "エラー" }),
  ).rejects.toThrow(UpdateCategoryError);
  await expect(
    updateCategory({ id: "category-1", name: "エラー" }),
  ).rejects.toThrow("カテゴリの更新に失敗しました。");
});
