import { ResultAsync } from "neverthrow";
import { db } from "../db";
import type { Payment } from "./paymentSchema";

type Input = { fileName: string; payments: Payment[] }[];
type Output = undefined;
type Return = ResultAsync<
  Output,
  CreatePaymentsUnknownError | CreatePaymentsConstraintError
>;

export function createPayments(items: Input): Return {
  return ResultAsync.fromPromise(
    (async () => {
      await db.paymentFiles.bulkAdd(
        items.map((item) => ({
          fileName: item.fileName,
          payments: item.payments,
        })),
      );

      return undefined;
    })(),
    (err) => {
      if (isDexieConstraintError(err)) {
        return new CreatePaymentsConstraintError(
          `ファイルは既に登録されています。別のファイルを選択してください。`,
          { cause: err },
        );
      }

      return new CreatePaymentsUnknownError("不明なエラーが発生しました。", {
        cause: err,
      });
    },
  );
}

function isDexieConstraintError(error: unknown): boolean {
  return error instanceof Error && error.name === "ConstraintError";
}

export class CreatePaymentsUnknownError extends Error {
  override readonly name = "CreatePaymentsUnknownError" as const;
  constructor(message: string, options?: { cause: unknown }) {
    super(message, options);
    this.cause = options?.cause;
  }
}

export class CreatePaymentsConstraintError extends Error {
  override readonly name = "CreatePaymentsConstraintError" as const;
  constructor(message: string, options?: { cause: unknown }) {
    super(message, options);
    this.cause = options?.cause;
  }
}
