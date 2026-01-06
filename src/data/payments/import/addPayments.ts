import { convertCsvDataToPaymentData } from "./convertCsvDataToPaymentData";
import {
  createPayments,
  CreatePaymentsConstraintError,
} from "./createPayments";
import {
  convertFileToCsvData,
  ConvertFileToCsvInvalidCsvError,
} from "./convertFileToCsvData";
import type { Payment } from "./paymentSchema";

export async function addPayments(files: File[]): Promise<void> {
  // Step 1: CSVファイルをパース
  let csvDataList: { fileName: string; csvData: unknown[] }[];
  try {
    csvDataList = await Promise.all(
      files.map(async (file) => {
        const csvDataItem = await convertFileToCsvData({ file });
        return {
          fileName: file.name,
          ...csvDataItem,
        };
      }),
    );
  } catch (err) {
    console.error(err);
    if (err instanceof ConvertFileToCsvInvalidCsvError) {
      throw new AddPaymentsInvalidFileError(
        "CSVデータを読み取れませんでした。",
        {
          cause: err,
        },
      );
    }
    throw new Error("不明なエラーが発生しました。", { cause: err });
  }

  // Step 2: CSVデータを支払いデータに変換
  let paymentDataList: { fileName: string; payments: Payment[] }[];
  try {
    paymentDataList = csvDataList.map((csvDataItem) => {
      const paymentDataItem = convertCsvDataToPaymentData(csvDataItem);
      return {
        fileName: csvDataItem.fileName,
        ...paymentDataItem,
      };
    });
  } catch (err) {
    console.error(err);
    throw new AddPaymentsInvalidFileError("ファイルの形式が不正です。", {
      cause: err,
    });
  }

  // Step 3: ソートとフィルタリング
  const sortedPaymentData = paymentDataList.map((item) => ({
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

  // Step 4: DBに保存
  try {
    await createPayments(filteredPaymentData);
  } catch (err) {
    console.error(err);
    if (err instanceof CreatePaymentsConstraintError) {
      throw new AddPaymentsConstraintError(
        "ファイルは既に登録されています。別のファイルを選択してください。",
        { cause: err },
      );
    }
    throw new Error("不明なエラーが発生しました。", { cause: err });
  }
}

export class AddPaymentsInvalidFileError extends Error {
  override readonly name = "AddPaymentsInvalidFileError" as const;
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
