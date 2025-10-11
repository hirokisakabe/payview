import { ok, Result } from "neverthrow";
import { db } from "./db";
import { parsePaymentFile } from "./parsePaymentFile";
import { createErr } from "../utils/createErr";

export async function addPayments(
  file: File,
): Promise<Result<void, AddPaymentsUnknownError | AddPaymentsConstraintError>> {
  try {
    const payments = await parsePaymentFile(file);

    await db.paymentFiles.add({
      fileName: file.name,
      payments,
    });

    return ok();
  } catch (error) {
    if (isDexieConstraintError(error)) {
      return createErr(
        new AddPaymentsConstraintError(
          `ファイル「${file.name}」は既に登録されています。別のファイルを選択してください。`,
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
