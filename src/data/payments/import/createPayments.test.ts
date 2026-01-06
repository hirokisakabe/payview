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

  await createPayments([
    {
      fileName: "test.csv",
      payments: [{ date: "2023-01-01", name: "食費", price: 1000, count: 1 }],
    },
  ]);

  expect(db.paymentFiles.bulkAdd).toHaveBeenCalledWith([
    {
      fileName: "test.csv",
      payments: [{ date: "2023-01-01", name: "食費", price: 1000, count: 1 }],
    },
  ]);
});

test("異常系: 重複ファイルの場合、CreatePaymentsConstraintErrorをthrowする", async () => {
  const constraintError = new Error("ConstraintError");
  constraintError.name = "ConstraintError";
  vi.mocked(db.paymentFiles.bulkAdd).mockRejectedValue(constraintError);

  await expect(
    createPayments([
      {
        fileName: "duplicate.csv",
        payments: [{ date: "2023-01-01", name: "食費", price: 1000, count: 1 }],
      },
    ]),
  ).rejects.toThrow(CreatePaymentsConstraintError);

  await expect(
    createPayments([
      {
        fileName: "duplicate.csv",
        payments: [{ date: "2023-01-01", name: "食費", price: 1000, count: 1 }],
      },
    ]),
  ).rejects.toThrow(
    "ファイルは既に登録されています。別のファイルを選択してください。",
  );
});

test("異常系: その他のエラーの場合、CreatePaymentsUnknownErrorをthrowする", async () => {
  vi.mocked(db.paymentFiles.bulkAdd).mockRejectedValue(
    new Error("Unknown error"),
  );

  await expect(
    createPayments([
      {
        fileName: "test.csv",
        payments: [{ date: "2023-01-01", name: "食費", price: 1000, count: 1 }],
      },
    ]),
  ).rejects.toThrow(CreatePaymentsUnknownError);

  await expect(
    createPayments([
      {
        fileName: "test.csv",
        payments: [{ date: "2023-01-01", name: "食費", price: 1000, count: 1 }],
      },
    ]),
  ).rejects.toThrow("不明なエラーが発生しました。");
});
