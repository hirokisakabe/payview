import { beforeEach, expect, test, vi } from "vitest";
import { reorderCategories, ReorderCategoriesError } from "./reorderCategories";

const { mockTransaction, mockCategoriesUpdate } = vi.hoisted(() => ({
  mockTransaction: vi.fn(),
  mockCategoriesUpdate: vi.fn(),
}));

vi.mock("../db", () => ({
  db: {
    transaction: mockTransaction,
    categories: {
      update: mockCategoriesUpdate,
    },
  },
}));

beforeEach(() => {
  vi.clearAllMocks();
});

test("正常系: カテゴリの順序が更新される", async () => {
  mockTransaction.mockImplementation(async (_mode, _table, callback) => {
    await callback();
  });
  mockCategoriesUpdate.mockResolvedValue(1);

  const result = await reorderCategories({
    categoryIds: ["category-3", "category-1", "category-2"],
  });

  expect(result.isOk()).toBe(true);
  expect(result._unsafeUnwrap()).toBe(undefined);
  expect(mockTransaction).toHaveBeenCalled();
});

test("正常系: 空の配列でも正常に処理される", async () => {
  mockTransaction.mockImplementation(async (_mode, _table, callback) => {
    await callback();
  });

  const result = await reorderCategories({ categoryIds: [] });

  expect(result.isOk()).toBe(true);
});

test("異常系: トランザクションでエラーが発生した場合", async () => {
  mockTransaction.mockRejectedValue(new Error("Transaction Error"));

  const result = await reorderCategories({ categoryIds: ["category-1"] });

  expect(result.isErr()).toBe(true);
  expect(result._unsafeUnwrapErr()).toBeInstanceOf(ReorderCategoriesError);
  expect(result._unsafeUnwrapErr().message).toBe(
    "カテゴリの並び替えに失敗しました。",
  );
});
