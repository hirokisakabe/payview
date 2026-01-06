import { beforeEach, expect, test, vi } from "vitest";
import { deleteCategoryRule } from "./deleteCategoryRule";

vi.mock("../db", () => ({
  db: {
    categoryRules: {
      delete: vi.fn(),
    },
  },
}));

import { db } from "../db";

beforeEach(() => {
  vi.clearAllMocks();
});

test("正常系: ルールが削除される", async () => {
  vi.mocked(db.categoryRules.delete).mockResolvedValue(undefined as never);

  await deleteCategoryRule({ id: "rule-1" });

  expect(db.categoryRules.delete).toHaveBeenCalledWith("rule-1");
});

test("異常系: DB操作でエラーが発生した場合", async () => {
  vi.mocked(db.categoryRules.delete).mockRejectedValue(
    new Error("DB Error") as never,
  );

  await expect(deleteCategoryRule({ id: "rule-1" })).rejects.toThrow(
    "ルールの削除に失敗しました。",
  );
});
