import { beforeEach, expect, test, vi } from "vitest";
import { updateCategoryRule } from "./updateCategoryRule";

vi.mock("../db", () => ({
  db: {
    categoryRules: {
      update: vi.fn(),
    },
  },
}));

import { db } from "../db";

beforeEach(() => {
  vi.clearAllMocks();
});

test("正常系: ルールのパターンが更新される", async () => {
  vi.mocked(db.categoryRules.update).mockResolvedValue(1 as never);

  await updateCategoryRule({
    id: "rule-1",
    pattern: "新しいパターン.*",
  });

  expect(db.categoryRules.update).toHaveBeenCalledWith("rule-1", {
    pattern: "新しいパターン.*",
  });
});

test("異常系: DB操作でエラーが発生した場合", async () => {
  vi.mocked(db.categoryRules.update).mockRejectedValue(
    new Error("DB Error") as never,
  );

  await expect(
    updateCategoryRule({ id: "rule-1", pattern: "エラー" }),
  ).rejects.toThrow("ルールの更新に失敗しました。");
});
