import { beforeEach, expect, test, vi } from "vitest";
import {
  createPayments,
  upsertPayments,
  CreatePaymentsConstraintError,
} from "./createPayments";

vi.mock("../../db", () => ({
  db: {
    paymentFiles: {
      bulkAdd: vi.fn(),
      bulkPut: vi.fn(),
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
  ).rejects.toThrow("ファイルは既に登録されています。");
});

test("異常系: BulkErrorの場合、conflictingFileNamesにfailedKeysが含まれる", async () => {
  const constraintError = Object.assign(new Error("BulkError"), {
    name: "BulkError",
    failures: [
      Object.assign(new Error("ConstraintError"), { name: "ConstraintError" }),
    ],
    failedKeys: ["duplicate.csv"],
  });
  vi.mocked(db.paymentFiles.bulkAdd).mockRejectedValue(constraintError);

  const result = createPayments([
    {
      fileName: "duplicate.csv",
      payments: [{ date: "2023-01-01", name: "食費", price: 1000, count: 1 }],
    },
  ]);

  await expect(result).rejects.toMatchObject({
    conflictingFileNames: ["duplicate.csv"],
  });
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
  ).rejects.toThrow("不明なエラーが発生しました。");
});

test("upsertPayments: bulkPutを呼び出す", async () => {
  vi.mocked(db.paymentFiles.bulkPut).mockResolvedValue([] as never);

  await upsertPayments([
    {
      fileName: "test.csv",
      payments: [{ date: "2023-01-01", name: "食費", price: 1000, count: 1 }],
    },
  ]);

  expect(db.paymentFiles.bulkPut).toHaveBeenCalledWith([
    {
      fileName: "test.csv",
      payments: [{ date: "2023-01-01", name: "食費", price: 1000, count: 1 }],
    },
  ]);
});
