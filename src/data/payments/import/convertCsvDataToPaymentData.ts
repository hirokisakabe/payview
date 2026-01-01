import { z } from "zod";
import { Result } from "neverthrow";
import { paymentSchema, type Payment } from "./paymentSchema";

type Input = { csvData: unknown[] };
type Output = { payments: Payment[] };
type Return = Result<Output, ConvertCsvDataToPaymentDataInvalidSchemaError>;

export function convertCsvDataToPaymentData(input: Input): Return {
  return Result.fromThrowable(
    () => ({
      payments: z.array(paymentSchema).parse(input.csvData),
    }),
    (err) =>
      new ConvertCsvDataToPaymentDataInvalidSchemaError(
        "ファイルの形式が不正です。",
        { cause: err },
      ),
  )();
}

export class ConvertCsvDataToPaymentDataInvalidSchemaError extends Error {
  override readonly name =
    "ConvertCsvDataToPaymentDataInvalidSchemaError" as const;
  constructor(message: string, options?: { cause: unknown }) {
    super(message, options);
    this.cause = options?.cause;
  }
}
