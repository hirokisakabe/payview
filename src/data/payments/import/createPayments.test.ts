import { beforeEach, expect, test, vi } from "vitest";
import {
  createPayments,
  CreatePaymentsConstraintError,
  CreatePaymentsUnknownError,
} from "./createPayments";

vi.mock("../../db", () => ({
  db: {
    paymentFiles: {
      bulkAdd: vi.fn(),
    },
  },
}));

import { db } from "../../db";

beforeEach(() => {
  vi.clearAllMocks();
});

test("正常系: 支払いデータがDBに登録される", async () => {
  vi.mocked(db.paymentFiles.bulkAdd).mockResolvedValue(undefined as never);

  const result = await createPayments([
    {
      fileName: "test.csv",
      payments: [{ date: "2023-01-01", name: "食費", price: 1000, count: 1 }],
    },
  ]);

  expect(result.isOk()).toBe(true);
  expect(db.paymentFiles.bulkAdd).toHaveBeenCalledWith([
    {
      fileName: "test.csv",
      payments: [{ date: "2023-01-01", name: "食費", price: 1000, count: 1 }],
    },
  ]);
});

test("異常系: 重複ファイルの場合、CreatePaymentsConstraintErrorを返す", async () => {
  const constraintError = new Error("ConstraintError");
  constraintError.name = "ConstraintError";
  vi.mocked(db.paymentFiles.bulkAdd).mockRejectedValue(constraintError);

  const result = await createPayments([
    {
      fileName: "duplicate.csv",
      payments: [{ date: "2023-01-01", name: "食費", price: 1000, count: 1 }],
    },
  ]);

  expect(result.isErr()).toBe(true);
  expect(result._unsafeUnwrapErr()).toBeInstanceOf(
    CreatePaymentsConstraintError,
  );
  expect(result._unsafeUnwrapErr().message).toBe(
    "ファイルは既に登録されています。別のファイルを選択してください。",
  );
});

test("異常系: その他のエラーの場合、CreatePaymentsUnknownErrorを返す", async () => {
  vi.mocked(db.paymentFiles.bulkAdd).mockRejectedValue(
    new Error("Unknown error"),
  );

  const result = await createPayments([
    {
      fileName: "test.csv",
      payments: [{ date: "2023-01-01", name: "食費", price: 1000, count: 1 }],
    },
  ]);

  expect(result.isErr()).toBe(true);
  expect(result._unsafeUnwrapErr()).toBeInstanceOf(CreatePaymentsUnknownError);
  expect(result._unsafeUnwrapErr().message).toBe(
    "不明なエラーが発生しました。",
  );
});
