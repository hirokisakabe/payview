import { beforeEach, expect, test, vi } from "vitest";
import { deleteTag, DeleteTagError } from "./deleteTag";

const { mockTransaction, mockTagRulesWhere, mockTagsDelete } = vi.hoisted(
  () => ({
    mockTransaction: vi.fn(),
    mockTagRulesWhere: vi.fn(),
    mockTagsDelete: vi.fn(),
  }),
);

vi.mock("../db", () => ({
  db: {
    transaction: mockTransaction,
    tags: {
      delete: mockTagsDelete,
    },
    tagRules: {
      where: mockTagRulesWhere,
    },
  },
}));

beforeEach(() => {
  vi.clearAllMocks();
});

test("正常系: タグと関連ルールが削除される", async () => {
  mockTransaction.mockImplementation(async (_mode, _tables, callback) => {
    await callback();
  });
  mockTagRulesWhere.mockReturnValue({
    equals: vi.fn().mockReturnValue({
      delete: vi.fn().mockResolvedValue(2),
    }),
  });
  mockTagsDelete.mockResolvedValue(undefined);

  const result = await deleteTag({ id: "tag-1" });

  expect(result.isOk()).toBe(true);
  expect(result._unsafeUnwrap()).toBe(undefined);
  expect(mockTransaction).toHaveBeenCalled();
});

test("異常系: トランザクションでエラーが発生した場合", async () => {
  mockTransaction.mockRejectedValue(new Error("Transaction Error"));

  const result = await deleteTag({ id: "tag-1" });

  expect(result.isErr()).toBe(true);
  expect(result._unsafeUnwrapErr()).toBeInstanceOf(DeleteTagError);
  expect(result._unsafeUnwrapErr().message).toBe("タグの削除に失敗しました。");
});
