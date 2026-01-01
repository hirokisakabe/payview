import { db } from "../db";

export async function deletePaymentFile(fileName: string) {
  return db.paymentFiles.delete(fileName);
}
