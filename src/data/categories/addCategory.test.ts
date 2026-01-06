import { beforeEach, expect, test, vi } from "vitest";
import { addCategory } from "./addCategory";

vi.mock("../db", () => ({
  db: {
    categories: {
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

test("正常系: カテゴリが存在しない場合、order=0で追加される", async () => {
  vi.mocked(db.categories.orderBy).mockReturnValue({
    last: vi.fn().mockResolvedValue(undefined),
  } as never);
  vi.mocked(db.categories.add).mockResolvedValue("test-uuid-1234" as never);

  const result = await addCategory({ name: "食費" });

  expect(result).toBe("test-uuid-1234");
  expect(db.categories.add).toHaveBeenCalledWith({
    id: "test-uuid-1234",
    name: "食費",
    order: 0,
  });
});

test("正常系: 既存カテゴリがある場合、order=maxOrder+1で追加される", async () => {
  vi.mocked(db.categories.orderBy).mockReturnValue({
    last: vi.fn().mockResolvedValue({ id: "existing", name: "既存", order: 5 }),
  } as never);
  vi.mocked(db.categories.add).mockResolvedValue("test-uuid-1234" as never);

  const result = await addCategory({ name: "交通費" });

  expect(result).toBe("test-uuid-1234");
  expect(db.categories.add).toHaveBeenCalledWith({
    id: "test-uuid-1234",
    name: "交通費",
    order: 6,
  });
});

test("異常系: DB操作でエラーが発生した場合", async () => {
  vi.mocked(db.categories.orderBy).mockReturnValue({
    last: vi.fn().mockRejectedValue(new Error("DB Error")),
  } as never);

  await expect(addCategory({ name: "エラー" })).rejects.toThrow(
    "カテゴリの追加に失敗しました。",
  );
});
