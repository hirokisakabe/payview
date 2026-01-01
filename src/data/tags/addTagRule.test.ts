import { beforeEach, expect, test, vi } from "vitest";
import { addTagRule, AddTagRuleError } from "./addTagRule";

vi.mock("../db", () => ({
  db: {
    tagRules: {
      where: vi.fn(),
      add: vi.fn(),
    },
  },
}));

import { db } from "../db";

beforeEach(() => {
  vi.clearAllMocks();
  vi.stubGlobal("crypto", {
    randomUUID: () => "test-rule-uuid-1234",
  });
});

test("正常系: ルールが存在しない場合、order=0で追加される", async () => {
  vi.mocked(db.tagRules.where).mockReturnValue({
    equals: vi.fn().mockReturnValue({
      sortBy: vi.fn().mockResolvedValue([]),
    }),
  } as never);
  vi.mocked(db.tagRules.add).mockResolvedValue("test-rule-uuid-1234" as never);

  const result = await addTagRule({ tagId: "tag-1", pattern: "スーパー.*" });

  expect(result.isOk()).toBe(true);
  expect(result._unsafeUnwrap()).toBe("test-rule-uuid-1234");
  expect(db.tagRules.add).toHaveBeenCalledWith({
    id: "test-rule-uuid-1234",
    tagId: "tag-1",
    pattern: "スーパー.*",
    order: 0,
  });
});

test("正常系: 既存ルールがある場合、order=maxOrder+1で追加される", async () => {
  vi.mocked(db.tagRules.where).mockReturnValue({
    equals: vi.fn().mockReturnValue({
      sortBy: vi.fn().mockResolvedValue([
        { id: "rule-1", tagId: "tag-1", pattern: "既存", order: 0 },
        { id: "rule-2", tagId: "tag-1", pattern: "既存2", order: 3 },
      ]),
    }),
  } as never);
  vi.mocked(db.tagRules.add).mockResolvedValue("test-rule-uuid-1234" as never);

  const result = await addTagRule({ tagId: "tag-1", pattern: "新規.*" });

  expect(result.isOk()).toBe(true);
  expect(db.tagRules.add).toHaveBeenCalledWith({
    id: "test-rule-uuid-1234",
    tagId: "tag-1",
    pattern: "新規.*",
    order: 4,
  });
});

test("異常系: DB操作でエラーが発生した場合", async () => {
  vi.mocked(db.tagRules.where).mockReturnValue({
    equals: vi.fn().mockReturnValue({
      sortBy: vi.fn().mockRejectedValue(new Error("DB Error")),
    }),
  } as never);

  const result = await addTagRule({ tagId: "tag-1", pattern: "エラー" });

  expect(result.isErr()).toBe(true);
  expect(result._unsafeUnwrapErr()).toBeInstanceOf(AddTagRuleError);
  expect(result._unsafeUnwrapErr().message).toBe(
    "ルールの追加に失敗しました。",
  );
});
