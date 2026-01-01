import { beforeEach, expect, test, vi } from "vitest";
import { updateTag, UpdateTagError } from "./updateTag";

vi.mock("../db", () => ({
  db: {
    tags: {
      update: vi.fn(),
    },
  },
}));

import { db } from "../db";

beforeEach(() => {
  vi.clearAllMocks();
});

test("正常系: タグ名が更新される", async () => {
  vi.mocked(db.tags.update).mockResolvedValue(1 as never);

  const result = await updateTag({ id: "tag-1", name: "新しい名前" });

  expect(result.isOk()).toBe(true);
  expect(result._unsafeUnwrap()).toBe(undefined);
  expect(db.tags.update).toHaveBeenCalledWith("tag-1", { name: "新しい名前" });
});

test("異常系: DB操作でエラーが発生した場合", async () => {
  vi.mocked(db.tags.update).mockRejectedValue(new Error("DB Error") as never);

  const result = await updateTag({ id: "tag-1", name: "エラー" });

  expect(result.isErr()).toBe(true);
  expect(result._unsafeUnwrapErr()).toBeInstanceOf(UpdateTagError);
  expect(result._unsafeUnwrapErr().message).toBe("タグの更新に失敗しました。");
});
