import { beforeEach, expect, test, vi } from "vitest";
import {
  reorderCategoryRules,
  ReorderCategoryRulesError,
} from "./reorderCategoryRules";

const { mockTransaction, mockCategoryRulesUpdate } = vi.hoisted(() => ({
  mockTransaction: vi.fn(),
  mockCategoryRulesUpdate: vi.fn(),
}));

vi.mock("../db", () => ({
  db: {
    transaction: mockTransaction,
    categoryRules: {
      update: mockCategoryRulesUpdate,
    },
  },
}));

beforeEach(() => {
  vi.clearAllMocks();
});

test("正常系: ルールの順序が更新される", async () => {
  mockTransaction.mockImplementation(async (_mode, _table, callback) => {
    await callback();
  });
  mockCategoryRulesUpdate.mockResolvedValue(1);

  const result = await reorderCategoryRules({
    ruleIds: ["rule-3", "rule-1", "rule-2"],
  });

  expect(result.isOk()).toBe(true);
  expect(result._unsafeUnwrap()).toBe(undefined);
  expect(mockTransaction).toHaveBeenCalled();
});

test("正常系: 空の配列でも正常に処理される", async () => {
  mockTransaction.mockImplementation(async (_mode, _table, callback) => {
    await callback();
  });

  const result = await reorderCategoryRules({ ruleIds: [] });

  expect(result.isOk()).toBe(true);
});

test("異常系: トランザクションでエラーが発生した場合", async () => {
  mockTransaction.mockRejectedValue(new Error("Transaction Error"));

  const result = await reorderCategoryRules({ ruleIds: ["rule-1"] });

  expect(result.isErr()).toBe(true);
  expect(result._unsafeUnwrapErr()).toBeInstanceOf(ReorderCategoryRulesError);
  expect(result._unsafeUnwrapErr().message).toBe(
    "ルールの並び替えに失敗しました。",
  );
});
