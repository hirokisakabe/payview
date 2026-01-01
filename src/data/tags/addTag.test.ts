import { beforeEach, expect, test, vi } from "vitest";
import { addTag, AddTagError } from "./addTag";

vi.mock("../db", () => ({
  db: {
    tags: {
      orderBy: vi.fn(),
      add: vi.fn(),
    },
  },
}));

import { db } from "../db";

beforeEach(() => {
  vi.clearAllMocks();
  vi.stubGlobal("crypto", {
    randomUUID: () => "test-uuid-1234",
  });
});

test("正常系: タグが存在しない場合、order=0で追加される", async () => {
  vi.mocked(db.tags.orderBy).mockReturnValue({
    last: vi.fn().mockResolvedValue(undefined),
  } as never);
  vi.mocked(db.tags.add).mockResolvedValue("test-uuid-1234" as never);

  const result = await addTag({ name: "食費" });

  expect(result.isOk()).toBe(true);
  expect(result._unsafeUnwrap()).toBe("test-uuid-1234");
  expect(db.tags.add).toHaveBeenCalledWith({
    id: "test-uuid-1234",
    name: "食費",
    order: 0,
  });
});

test("正常系: 既存タグがある場合、order=maxOrder+1で追加される", async () => {
  vi.mocked(db.tags.orderBy).mockReturnValue({
    last: vi.fn().mockResolvedValue({ id: "existing", name: "既存", order: 5 }),
  } as never);
  vi.mocked(db.tags.add).mockResolvedValue("test-uuid-1234" as never);

  const result = await addTag({ name: "交通費" });

  expect(result.isOk()).toBe(true);
  expect(db.tags.add).toHaveBeenCalledWith({
    id: "test-uuid-1234",
    name: "交通費",
    order: 6,
  });
});

test("異常系: DB操作でエラーが発生した場合", async () => {
  vi.mocked(db.tags.orderBy).mockReturnValue({
    last: vi.fn().mockRejectedValue(new Error("DB Error")),
  } as never);

  const result = await addTag({ name: "エラー" });

  expect(result.isErr()).toBe(true);
  expect(result._unsafeUnwrapErr()).toBeInstanceOf(AddTagError);
  expect(result._unsafeUnwrapErr().message).toBe("タグの追加に失敗しました。");
});
