import { useEffect, useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { parse } from "csv-parse/browser/esm/sync";
import { z } from "zod";
import { db } from "./db";
import Encoding from "encoding-japanese";

type Props = {
  fileName: string;
};

const paymentSchema = z.object({
  date: z.string(),
  name: z.string(),
  price: z.string(),
  count: z.string(),
});

type Payment = z.infer<typeof paymentSchema>;

export function usePayments({ fileName }: Props) {
  const files = useLiveQuery(() =>
    db.paymentFiles.where("fileName").equals(fileName).toArray(),
  );
  const file = files ? files[0] : undefined;

  const [payments, setPayments] = useState<Payment[]>();

  useEffect(() => {
    void (async () => {
      if (!file) {
        return [];
      }

      const arrayBuffer = await file.blob.arrayBuffer();
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

      const _payments = records.map((record) => {
        const payment = paymentSchema.safeParse(record);
        if (payment.success) {
          return payment.data;
        } else {
          console.error("Invalid record:", record, payment.error);
          throw new Error("Invalid payment record");
        }
      });

      _payments.sort((a, b) => {
        return new Date(a.date).getTime() - new Date(b.date).getTime();
      });

      setPayments(_payments);
    })();
  }, [file]);

  if (!payments) {
    return { status: "loading" as const };
  }

  return { status: "completed" as const, payments };
}
