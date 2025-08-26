import { parse } from "csv-parse/browser/esm/sync";
import { z } from "zod";
import Encoding from "encoding-japanese";

const paymentSchema = z.object({
  date: z.string(),
  name: z.string(),
  price: z.string().transform((val) => parseInt(val, 10)),
  count: z.string().transform((val) => parseInt(val, 10)),
});

export async function parsePaymentFile(file: File) {
  const arrayBuffer = await file.arrayBuffer();
  const uint8 = new Uint8Array(arrayBuffer);
  const paymentText = Encoding.convert(uint8, {
    from: "SJIS",
    to: "UTF8",
  });

  const records = parse(paymentText, {
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

  const parsedPayments = records.map((record) => {
    const payment = paymentSchema.safeParse(record);
    if (payment.success) {
      return payment.data;
    } else {
      console.error("Invalid record:", record, payment.error);
      throw new Error("Invalid payment record");
    }
  });

  const sortedPayments = parsedPayments.sort((a, b) => {
    return new Date(a.date).getTime() - new Date(b.date).getTime();
  });

  const filteredPayments = sortedPayments.filter(
    (payment) => payment.name.length > 0,
  );

  return filteredPayments;
}
