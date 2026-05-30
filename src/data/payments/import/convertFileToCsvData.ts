import { parse } from "csv-parse/browser/esm/sync";
import Encoding from "encoding-japanese";

type Input = { file: File };
type Output = { csvData: unknown[] };

// 確定後フォーマット（7カラム）: date, name, price, count, ...
const CONFIRMED_FORMAT_COLUMNS = [
  "date",
  "name",
  "price",
  "count",
  "noname1",
  "noname2",
  "noname3",
];

// 確定前フォーマット（13カラム）: date, name, 本人, 支払方法, 空, 請求月, price, ...
const PENDING_FORMAT_COLUMNS = [
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

// エクスポートフォーマット（4カラム、ヘッダー行あり）: 日付, 金額, カテゴリ, 説明
const EXPORT_FORMAT_COLUMNS = ["date", "price", "category", "name"];

type FormatConfig = { columns: string[]; fromLine: number };

function detectFormat(text: string): FormatConfig {
  const textWithoutBom = text.charCodeAt(0) === 0xfeff ? text.slice(1) : text;
  const lines = textWithoutBom
    .split("\n")
    .filter((line) => line.trim().length > 0);
  if (lines.length === 0) {
    return { columns: CONFIRMED_FORMAT_COLUMNS, fromLine: 1 };
  }
  // ダブルクォートを除去してヘッダー行を比較（エクスポートCSVは全セルクォート済み）
  const firstLineUnquoted = lines[0].replace(/"/g, "");
  if (firstLineUnquoted.startsWith("日付,金額,カテゴリ,説明")) {
    return { columns: EXPORT_FORMAT_COLUMNS, fromLine: 2 };
  }
  const firstLineColumnCount = lines[0].split(",").length;
  return {
    columns:
      firstLineColumnCount >= 13
        ? PENDING_FORMAT_COLUMNS
        : CONFIRMED_FORMAT_COLUMNS,
    fromLine: 1,
  };
}

function normalizeToCommonFormat(
  csvData: Record<string, string>[],
  columns: string[],
): unknown[] {
  // 確定前フォーマットの場合、countをデフォルト値1に設定
  if (columns === PENDING_FORMAT_COLUMNS) {
    return csvData.map((row) => ({
      date: row.date,
      name: row.name,
      price: row.price,
      count: "1",
    }));
  }
  // エクスポートフォーマットの場合、説明をname、countを1に設定
  if (columns === EXPORT_FORMAT_COLUMNS) {
    return csvData.map((row) => ({
      date: row.date,
      name: row.name,
      price: row.price,
      count: "1",
    }));
  }
  return csvData;
}

export async function convertFileToCsvData(input: Input): Promise<Output> {
  let csvData: unknown[];

  try {
    const arrayBuffer = await input.file.arrayBuffer();
    const uint8 = new Uint8Array(arrayBuffer);

    // UTF-8 BOM (0xEF 0xBB 0xBF) があればそのままデコード、なければ SJIS→UTF8 変換
    const isUtf8WithBom =
      uint8.length >= 3 &&
      uint8[0] === 0xef &&
      uint8[1] === 0xbb &&
      uint8[2] === 0xbf;

    let paymentTextArray: string | number[];
    let paymentText: string;
    if (isUtf8WithBom) {
      paymentText = new TextDecoder("utf-8").decode(uint8.slice(3));
      paymentTextArray = paymentText;
    } else {
      paymentTextArray = Encoding.convert(uint8, { from: "SJIS", to: "UTF8" });
      paymentText =
        typeof paymentTextArray === "string"
          ? paymentTextArray
          : String.fromCharCode(...paymentTextArray);
    }

    const { columns, fromLine } = detectFormat(paymentText);

    const rawCsvData: Record<string, string>[] = parse(paymentTextArray, {
      columns,
      skip_empty_lines: true,
      skipRecordsWithError: true,
      from_line: fromLine,
    });

    csvData = normalizeToCommonFormat(rawCsvData, columns);
  } catch (error) {
    throw new Error("不明なエラーが発生しました。", { cause: error });
  }

  if (csvData.length === 0) {
    throw new ConvertFileToCsvInvalidCsvError(
      "ファイルのデータを読み取れませんでした。",
    );
  }

  return { csvData };
}

export class ConvertFileToCsvInvalidCsvError extends Error {
  override readonly name = "ConvertFileToCsvInvalidCsvError" as const;
  constructor(message: string, options?: { cause: unknown }) {
    super(message, options);
    this.cause = options?.cause;
  }
}
