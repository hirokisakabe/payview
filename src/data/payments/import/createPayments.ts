import { db } from "../../db";
import type { Payment } from "./paymentSchema";

type Input = { fileName: string; payments: Payment[] }[];

export async function createPayments(items: Input): Promise<void> {
  try {
    await db.paymentFiles.bulkAdd(
      items.map((item) => ({
        fileName: item.fileName,
        payments: item.payments,
      })),
    );
  } catch (err) {
    if (isDexieConstraintError(err)) {
      throw new CreatePaymentsConstraintError(
        `ファイルは既に登録されています。別のファイルを選択してください。`,
        { cause: err },
      );
    }

    throw new Error("不明なエラーが発生しました。", { cause: err });
  }
}

function isDexieConstraintError(error: unknown): boolean {
  return error instanceof Error && error.name === "ConstraintError";
}

export class CreatePaymentsConstraintError extends Error {
  override readonly name = "CreatePaymentsConstraintError" as const;
  constructor(message: string, options?: { cause: unknown }) {
    super(message, options);
    this.cause = options?.cause;
  }
}
