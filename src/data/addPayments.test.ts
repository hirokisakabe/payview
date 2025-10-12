import { expect, test, vi } from "vitest";
import { addPayments } from "./addPayments";
import { parsePaymentFile } from "./parsePaymentFile";
import { db } from "./db";

vi.mock("./db");
vi.mock("./parsePaymentFile");

const dummyFiles = [
  new File(["dummy_data"], "test1.csv"),
  new File(["dummy_data"], "test2.csv"),
];

test("正常系: データ登録", async () => {
  const result = await addPayments(dummyFiles);

  expect(result.isOk()).toBe(true);
});

test("異常系: ファイルのパースでエラーになった場合", async () => {
  vi.mocked(parsePaymentFile).mockRejectedValueOnce(new Error("Parse error"));

  const result = await addPayments(dummyFiles);

  expect(result.isErr()).toBe(true);
  expect(result._unsafeUnwrapErr().name).toBe("AddPaymentsUnknownError");
});

test("異常系: IndexdDBへの登録でエラーが発生した場合(重複)", async () => {
  const error = new Error("Constraint error");
  error.name = "ConstraintError";
  vi.spyOn(db.paymentFiles, "bulkAdd").mockRejectedValueOnce(error);

  const secondResult = await addPayments(dummyFiles);

  expect(secondResult.isErr()).toBe(true);
  expect(secondResult._unsafeUnwrapErr().name).toBe(
    "AddPaymentsConstraintError",
  );
});

test("異常系: IndexdDBへの登録でエラーが発生した場合", async () => {
  const error = new Error("Dexie unknown error");
  vi.spyOn(db.paymentFiles, "bulkAdd").mockRejectedValueOnce(error);

  const secondResult = await addPayments(dummyFiles);

  expect(secondResult.isErr()).toBe(true);
  expect(secondResult._unsafeUnwrapErr().name).toBe("AddPaymentsUnknownError");
});
