import { beforeEach, expect, test, vi } from "vitest";
import { deleteTagRule, DeleteTagRuleError } from "./deleteTagRule";

vi.mock("../db", () => ({
  db: {
    tagRules: {
      delete: vi.fn(),
    },
  },
}));

import { db } from "../db";

beforeEach(() => {
  vi.clearAllMocks();
});

test("正常系: ルールが削除される", async () => {
  vi.mocked(db.tagRules.delete).mockResolvedValue(undefined as never);

  const result = await deleteTagRule({ id: "rule-1" });

  expect(result.isOk()).toBe(true);
  expect(result._unsafeUnwrap()).toBe(undefined);
  expect(db.tagRules.delete).toHaveBeenCalledWith("rule-1");
});

test("異常系: DB操作でエラーが発生した場合", async () => {
  vi.mocked(db.tagRules.delete).mockRejectedValue(
    new Error("DB Error") as never,
  );

  const result = await deleteTagRule({ id: "rule-1" });

  expect(result.isErr()).toBe(true);
  expect(result._unsafeUnwrapErr()).toBeInstanceOf(DeleteTagRuleError);
  expect(result._unsafeUnwrapErr().message).toBe(
    "ルールの削除に失敗しました。",
  );
});
