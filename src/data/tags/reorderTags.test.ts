import { beforeEach, expect, test, vi } from "vitest";
import { reorderTags, ReorderTagsError } from "./reorderTags";

const { mockTransaction, mockTagsUpdate } = vi.hoisted(() => ({
  mockTransaction: vi.fn(),
  mockTagsUpdate: vi.fn(),
}));

vi.mock("../db", () => ({
  db: {
    transaction: mockTransaction,
    tags: {
      update: mockTagsUpdate,
    },
  },
}));

beforeEach(() => {
  vi.clearAllMocks();
});

test("正常系: タグの順序が更新される", async () => {
  mockTransaction.mockImplementation(async (_mode, _table, callback) => {
    await callback();
  });
  mockTagsUpdate.mockResolvedValue(1);

  const result = await reorderTags({ tagIds: ["tag-3", "tag-1", "tag-2"] });

  expect(result.isOk()).toBe(true);
  expect(result._unsafeUnwrap()).toBe(undefined);
  expect(mockTransaction).toHaveBeenCalled();
});

test("正常系: 空の配列でも正常に処理される", async () => {
  mockTransaction.mockImplementation(async (_mode, _table, callback) => {
    await callback();
  });

  const result = await reorderTags({ tagIds: [] });

  expect(result.isOk()).toBe(true);
});

test("異常系: トランザクションでエラーが発生した場合", async () => {
  mockTransaction.mockRejectedValue(new Error("Transaction Error"));

  const result = await reorderTags({ tagIds: ["tag-1"] });

  expect(result.isErr()).toBe(true);
  expect(result._unsafeUnwrapErr()).toBeInstanceOf(ReorderTagsError);
  expect(result._unsafeUnwrapErr().message).toBe(
    "タグの並び替えに失敗しました。",
  );
});
