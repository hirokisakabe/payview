import { db } from "./db";
import { parsePaymentFile } from "./parsePaymentFile";

export async function addPayments(file: File) {
  const payments = await parsePaymentFile(file);

  return db.paymentFiles.add({
    fileName: file.name,
    payments,
  });
}
