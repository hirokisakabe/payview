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
      const conflictingFileNames = extractConflictingFileNames(err, items);
      throw new CreatePaymentsConstraintError(
        "ファイルは既に登録されています。",
        { cause: err, conflictingFileNames },
      );
    }

    throw new Error("不明なエラーが発生しました。", { cause: err });
  }
}

export async function upsertPayments(items: Input): Promise<void> {
  await db.paymentFiles.bulkPut(
    items.map((item) => ({
      fileName: item.fileName,
      payments: item.payments,
    })),
  );
}

function isDexieConstraintError(error: unknown): boolean {
  if (!(error instanceof Error)) {
    return false;
  }

  // Direct ConstraintError
  if (error.name === "ConstraintError") {
    return true;
  }

  // BulkError from bulkAdd - check if any failure is a ConstraintError
  if (error.name === "BulkError" && "failures" in error) {
    const failures = (error as { failures: Error[] }).failures;
    return failures.some((f) => f.name === "ConstraintError");
  }

  return false;
}

function extractConflictingFileNames(error: unknown, items: Input): string[] {
  if (!(error instanceof Error)) return [];

  if (error.name === "BulkError" && "failedKeys" in error) {
    const failedKeys = (error as { failedKeys: unknown[] }).failedKeys;
    return failedKeys.filter((k): k is string => typeof k === "string");
  }

  // Direct ConstraintError: single item case
  return items.map((item) => item.fileName);
}

export class CreatePaymentsConstraintError extends Error {
  override readonly name = "CreatePaymentsConstraintError" as const;
  readonly conflictingFileNames: string[];
  constructor(
    message: string,
    options?: { cause: unknown; conflictingFileNames?: string[] },
  ) {
    super(message, options);
    this.cause = options?.cause;
    this.conflictingFileNames = options?.conflictingFileNames ?? [];
  }
}
