import { parse } from "csv-parse/browser/esm/sync";
import Encoding from "encoding-japanese";
import { ResultAsync } from "neverthrow";

type Input = { file: File };
type Output = { csvData: unknown[] };
type Return = ResultAsync<Output, ConvertFileToCsvUnknownError>;

export function convertFileToCsvData(input: Input): Return {
  return ResultAsync.fromPromise(
    (async () => {
      const arrayBuffer = await input.file.arrayBuffer();
      const uint8 = new Uint8Array(arrayBuffer);
      const paymentText = Encoding.convert(uint8, {
        from: "SJIS",
        to: "UTF8",
      });

      const csvData = parse(paymentText, {
        columns: [
          "date",
          "name",
          "price",
          "count",
          "noname1",
          "noname2",
          "noname3",
        ],
        skip_empty_lines: true,
        skipRecordsWithError: true,
      });

      return { csvData };
    })(),
    (error) =>
      new ConvertFileToCsvUnknownError("不明なエラーが発生しました。", {
        cause: error,
      }),
  );
}

export class ConvertFileToCsvUnknownError extends Error {
  override readonly name = "ConvertFileToCsvUnknownError" as const;
  constructor(message: string, options?: { cause: unknown }) {
    super(message, options);
    this.cause = options?.cause;
  }
}
