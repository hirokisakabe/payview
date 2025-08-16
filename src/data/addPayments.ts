import { db } from "./db";

export function addPayments(file: File) {
  return db.paymentFiles.add({
    fileName: file.name,
    blob: file,
  });
}
