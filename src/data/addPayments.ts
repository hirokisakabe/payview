import { ok, Result } from "neverthrow";
import { db } from "./db";
import { parsePaymentFile } from "./parsePaymentFile";
import { createErr } from "../utils/createErr";

export async function addPayments(
  files: File[],
): Promise<Result<void, AddPaymentsUnknownError | AddPaymentsConstraintError>> {
  try {
    const insertData = await Promise.all(
      files.map(async (file) => {
        return {
          fileName: file.name,
          payments: await parsePaymentFile(file),
        };
      }),
    );

    await db.paymentFiles.bulkAdd(
      insertData.map((data) => ({
        fileName: data.fileName,
        payments: data.payments,
      })),
    );

    return ok();
  } catch (error) {
    if (isDexieConstraintError(error)) {
      return createErr(
        new AddPaymentsConstraintError(
          `ファイルは既に登録されています。別のファイルを選択してください。`,
          { cause: error },
        ),
      );
    }

    return createErr(
      new AddPaymentsUnknownError("不明なエラーが発生しました。", {
        cause: error,
      }),
    );
  }
}

function isDexieConstraintError(error: unknown): boolean {
  return error instanceof Error && error.name === "ConstraintError";
}

export class AddPaymentsUnknownError extends Error {
  override readonly name = "AddPaymentsUnknownError" as const;
  constructor(message: string, options?: { cause: unknown }) {
    super(message, options);
    this.cause = options?.cause;
  }
}

export class AddPaymentsConstraintError extends Error {
  override readonly name = "AddPaymentsConstraintError" as const;
  constructor(message: string, options?: { cause: unknown }) {
    super(message, options);
    this.cause = options?.cause;
  }
}
