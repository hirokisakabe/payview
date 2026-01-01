import { beforeEach, expect, test, vi } from "vitest";
import { updateTagRule, UpdateTagRuleError } from "./updateTagRule";

vi.mock("../db", () => ({
  db: {
    tagRules: {
      update: vi.fn(),
    },
  },
}));

import { db } from "../db";

beforeEach(() => {
  vi.clearAllMocks();
});

test("正常系: ルールのパターンが更新される", async () => {
  vi.mocked(db.tagRules.update).mockResolvedValue(1 as never);

  const result = await updateTagRule({
    id: "rule-1",
    pattern: "新しいパターン.*",
  });

  expect(result.isOk()).toBe(true);
  expect(result._unsafeUnwrap()).toBe(undefined);
  expect(db.tagRules.update).toHaveBeenCalledWith("rule-1", {
    pattern: "新しいパターン.*",
  });
});

test("異常系: DB操作でエラーが発生した場合", async () => {
  vi.mocked(db.tagRules.update).mockRejectedValue(
    new Error("DB Error") as never,
  );

  const result = await updateTagRule({ id: "rule-1", pattern: "エラー" });

  expect(result.isErr()).toBe(true);
  expect(result._unsafeUnwrapErr()).toBeInstanceOf(UpdateTagRuleError);
  expect(result._unsafeUnwrapErr().message).toBe(
    "ルールの更新に失敗しました。",
  );
});
