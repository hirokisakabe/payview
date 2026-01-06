import { beforeEach, expect, test, vi } from "vitest";
import { reorderCategoryRules } from "./reorderCategoryRules";

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

  await reorderCategoryRules({
    ruleIds: ["rule-3", "rule-1", "rule-2"],
  });

  expect(mockTransaction).toHaveBeenCalled();
});

test("正常系: 空の配列でも正常に処理される", async () => {
  mockTransaction.mockImplementation(async (_mode, _table, callback) => {
    await callback();
  });

  await expect(reorderCategoryRules({ ruleIds: [] })).resolves.toBeUndefined();
});

test("異常系: トランザクションでエラーが発生した場合", async () => {
  mockTransaction.mockRejectedValue(new Error("Transaction Error"));

  await expect(reorderCategoryRules({ ruleIds: ["rule-1"] })).rejects.toThrow(
    "Transaction Error",
  );
});
