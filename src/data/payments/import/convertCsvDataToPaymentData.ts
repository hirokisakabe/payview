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
    throw new Error("ファイルの形式が不正です。", { cause: err });
  }
}
