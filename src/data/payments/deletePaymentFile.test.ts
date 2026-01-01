import { beforeEach, expect, test, vi } from "vitest";
import { deletePaymentFile } from "./deletePaymentFile";

vi.mock("../db", () => ({
  db: {
    paymentFiles: {
      delete: vi.fn(),
    },
  },
}));

import { db } from "../db";

beforeEach(() => {
  vi.clearAllMocks();
});

test("正常系: 指定したファイルが削除される", async () => {
  vi.mocked(db.paymentFiles.delete).mockResolvedValue(undefined);

  await deletePaymentFile("test.csv");

  expect(db.paymentFiles.delete).toHaveBeenCalledWith("test.csv");
});

test("正常系: 存在しないファイル名でもエラーにならない", async () => {
  vi.mocked(db.paymentFiles.delete).mockResolvedValue(undefined);

  await deletePaymentFile("nonexistent.csv");

  expect(db.paymentFiles.delete).toHaveBeenCalledWith("nonexistent.csv");
});
