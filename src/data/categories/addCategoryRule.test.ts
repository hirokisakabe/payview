import { beforeEach, expect, test, vi } from "vitest";
import { addCategoryRule, AddCategoryRuleError } from "./addCategoryRule";

vi.mock("../db", () => ({
  db: {
    categoryRules: {
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
  vi.mocked(db.categoryRules.where).mockReturnValue({
    equals: vi.fn().mockReturnValue({
      sortBy: vi.fn().mockResolvedValue([]),
    }),
  } as never);
  vi.mocked(db.categoryRules.add).mockResolvedValue(
    "test-rule-uuid-1234" as never,
  );

  const result = await addCategoryRule({
    categoryId: "category-1",
    pattern: "スーパー.*",
  });

  expect(result).toBe("test-rule-uuid-1234");
  expect(db.categoryRules.add).toHaveBeenCalledWith({
    id: "test-rule-uuid-1234",
    categoryId: "category-1",
    pattern: "スーパー.*",
    order: 0,
  });
});

test("正常系: 既存ルールがある場合、order=maxOrder+1で追加される", async () => {
  vi.mocked(db.categoryRules.where).mockReturnValue({
    equals: vi.fn().mockReturnValue({
      sortBy: vi.fn().mockResolvedValue([
        { id: "rule-1", categoryId: "category-1", pattern: "既存", order: 0 },
        { id: "rule-2", categoryId: "category-1", pattern: "既存2", order: 3 },
      ]),
    }),
  } as never);
  vi.mocked(db.categoryRules.add).mockResolvedValue(
    "test-rule-uuid-1234" as never,
  );

  const result = await addCategoryRule({
    categoryId: "category-1",
    pattern: "新規.*",
  });

  expect(result).toBe("test-rule-uuid-1234");
  expect(db.categoryRules.add).toHaveBeenCalledWith({
    id: "test-rule-uuid-1234",
    categoryId: "category-1",
    pattern: "新規.*",
    order: 4,
  });
});

test("異常系: DB操作でエラーが発生した場合", async () => {
  vi.mocked(db.categoryRules.where).mockReturnValue({
    equals: vi.fn().mockReturnValue({
      sortBy: vi.fn().mockRejectedValue(new Error("DB Error")),
    }),
  } as never);

  await expect(
    addCategoryRule({
      categoryId: "category-1",
      pattern: "エラー",
    }),
  ).rejects.toThrow(AddCategoryRuleError);
  await expect(
    addCategoryRule({
      categoryId: "category-1",
      pattern: "エラー",
    }),
  ).rejects.toThrow("ルールの追加に失敗しました。");
});
