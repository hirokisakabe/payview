import { ok, Result, ResultAsync } from "neverthrow";
import { convertCsvDataToPaymentData } from "./convertCsvDataToPaymentData";
import {
  createPayments,
  CreatePaymentsConstraintError,
} from "./createPayments";
import { convertFileToCsvData } from "./convertFileToCsvData";
import { createErr } from "../../utils/createErr";

export async function addPayments(files: File[]) {
  const csvData = await ResultAsync.combine(
    files.map((file) =>
      convertFileToCsvData({ file }).map((csvDataItem) => ({
        fileName: file.name,
        ...csvDataItem,
      })),
    ),
  );

  if (csvData.isErr()) {
    return createErr(
      new AddPaymentsUnknownError("不明なエラーが発生しました。", {
        cause: csvData.error,
      }),
    );
  }

  const paymentData = Result.combine(
    csvData.value.map((csvDataItem) =>
      convertCsvDataToPaymentData(csvDataItem).map((paymentDataItem) => ({
        fileName: csvDataItem.fileName,
        ...paymentDataItem,
      })),
    ),
  );

  if (paymentData.isErr()) {
    return createErr(
      new AddPaymentsUnknownError("不明なエラーが発生しました。", {
        cause: paymentData.error,
      }),
    );
  }

  const sortedPaymentData = paymentData.value.map((item) => ({
    fileName: item.fileName,
    payments: item.payments.sort((a, b) => {
      return new Date(a.date).getTime() - new Date(b.date).getTime();
    }),
  }));

  const filteredPaymentData = sortedPaymentData.map(
    ({ fileName, payments }) => ({
      fileName,
      payments: payments.filter((payment) => payment.name.length > 0),
    }),
  );

  const createPaymentsResult = await createPayments(filteredPaymentData);

  if (createPaymentsResult.isErr()) {
    if (createPaymentsResult.error instanceof CreatePaymentsConstraintError) {
      return createErr(
        new AddPaymentsConstraintError(
          "ファイルは既に登録されています。別のファイルを選択してください。",
          { cause: createPaymentsResult.error },
        ),
      );
    } else {
      return createErr(
        new AddPaymentsUnknownError("不明なエラーが発生しました。", {
          cause: createPaymentsResult.error,
        }),
      );
    }
  }

  return ok(undefined);
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
