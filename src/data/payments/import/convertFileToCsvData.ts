import { parse } from "csv-parse/browser/esm/sync";
import Encoding from "encoding-japanese";
import { err, ok, ResultAsync } from "neverthrow";

type Input = { file: File };
type Output = { csvData: unknown[] };
type Return = ResultAsync<
  Output,
  ConvertFileToCsvUnknownError | ConvertFileToCsvInvalidCsvError
>;

// 旧フォーマット（7カラム）: date, name, price, count, ...
const OLD_FORMAT_COLUMNS = [
  "date",
  "name",
  "price",
  "count",
  "noname1",
  "noname2",
  "noname3",
];

// 新フォーマット（13カラム）: date, name, 本人, 支払方法, 空, 請求月, price, ...
const NEW_FORMAT_COLUMNS = [
  "date",
  "name",
  "holder",
  "paymentMethod",
  "noname1",
  "billingMonth",
  "price",
  "priceJpy",
  "noname2",
  "foreignAmount",
  "currency",
  "exchangeRate",
  "exchangeDate",
];

function detectFormat(text: string): string[] {
  const lines = text.split("\n").filter((line) => line.trim().length > 0);
  if (lines.length === 0) {
    return OLD_FORMAT_COLUMNS;
  }
  const firstLineColumnCount = lines[0].split(",").length;
  return firstLineColumnCount >= 13 ? NEW_FORMAT_COLUMNS : OLD_FORMAT_COLUMNS;
}

function normalizeToCommonFormat(
  csvData: Record<string, string>[],
  columns: string[],
): unknown[] {
  // 新フォーマットの場合、countをデフォルト値1に設定
  if (columns === NEW_FORMAT_COLUMNS) {
    return csvData.map((row) => ({
      date: row.date,
      name: row.name,
      price: row.price,
      count: "1",
    }));
  }
  return csvData;
}

export function convertFileToCsvData(input: Input): Return {
  return ResultAsync.fromPromise(
    (async () => {
      const arrayBuffer = await input.file.arrayBuffer();
      const uint8 = new Uint8Array(arrayBuffer);
      const paymentTextArray = Encoding.convert(uint8, {
        from: "SJIS",
        to: "UTF8",
      });
      const paymentText =
        typeof paymentTextArray === "string"
          ? paymentTextArray
          : String.fromCharCode(...paymentTextArray);

      const columns = detectFormat(paymentText);

      const rawCsvData: Record<string, string>[] = parse(paymentTextArray, {
        columns,
        skip_empty_lines: true,
        skipRecordsWithError: true,
      });

      const csvData = normalizeToCommonFormat(rawCsvData, columns);

      return { csvData };
    })(),
    (error) =>
      new ConvertFileToCsvUnknownError("不明なエラーが発生しました。", {
        cause: error,
      }),
  ).andThen(({ csvData }) => {
    if (csvData.length === 0) {
      return err(
        new ConvertFileToCsvInvalidCsvError(
          "ファイルのデータを読み取れませんでした。",
        ),
      );
    }

    return ok({ csvData });
  });
}

export class ConvertFileToCsvUnknownError extends Error {
  override readonly name = "ConvertFileToCsvUnknownError" as const;
  constructor(message: string, options?: { cause: unknown }) {
    super(message, options);
    this.cause = options?.cause;
  }
}

export class ConvertFileToCsvInvalidCsvError extends Error {
  override readonly name = "ConvertFileToCsvInvalidCsvError" as const;
  constructor(message: string, options?: { cause: unknown }) {
    super(message, options);
    this.cause = options?.cause;
  }
}
