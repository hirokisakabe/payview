import { beforeEach, expect, test, vi } from "vitest";
import { deleteCategory, DeleteCategoryError } from "./deleteCategory";

const { mockTransaction, mockCategoryRulesWhere, mockCategoriesDelete } =
  vi.hoisted(() => ({
    mockTransaction: vi.fn(),
    mockCategoryRulesWhere: vi.fn(),
    mockCategoriesDelete: vi.fn(),
  }));

vi.mock("../db", () => ({
  db: {
    transaction: mockTransaction,
    categories: {
      delete: mockCategoriesDelete,
    },
    categoryRules: {
      where: mockCategoryRulesWhere,
    },
  },
}));

beforeEach(() => {
  vi.clearAllMocks();
});

test("正常系: カテゴリと関連ルールが削除される", async () => {
  mockTransaction.mockImplementation(async (_mode, _tables, callback) => {
    await callback();
  });
  mockCategoryRulesWhere.mockReturnValue({
    equals: vi.fn().mockReturnValue({
      delete: vi.fn().mockResolvedValue(2),
    }),
  });
  mockCategoriesDelete.mockResolvedValue(undefined);

  await deleteCategory({ id: "category-1" });

  expect(mockTransaction).toHaveBeenCalled();
});

test("異常系: トランザクションでエラーが発生した場合", async () => {
  mockTransaction.mockRejectedValue(new Error("Transaction Error"));

  await expect(deleteCategory({ id: "category-1" })).rejects.toThrow(
    DeleteCategoryError,
  );
  await expect(deleteCategory({ id: "category-1" })).rejects.toThrow(
    "カテゴリの削除に失敗しました。",
  );
});
