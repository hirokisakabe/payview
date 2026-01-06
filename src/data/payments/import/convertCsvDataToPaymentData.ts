import { z } from "zod";
import { paymentSchema, type Payment } from "./paymentSchema";

type Input = { csvData: unknown[] };
type Output = { payments: Payment[] };

export function convertCsvDataToPaymentData(input: Input): Output {
  try {
    return {
      payments: z.array(paymentSchema).parse(input.csvData),
    };
  } catch (err) {
    throw new ConvertCsvDataToPaymentDataInvalidSchemaError(
      "ファイルの形式が不正です。",
      { cause: err },
    );
  }
}

export class ConvertCsvDataToPaymentDataInvalidSchemaError extends Error {
  override readonly name =
    "ConvertCsvDataToPaymentDataInvalidSchemaError" as const;
  constructor(message: string, options?: { cause: unknown }) {
    super(message, options);
    this.cause = options?.cause;
  }
}
