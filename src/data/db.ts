import Dexie, { type EntityTable } from "dexie";

interface PaymentFile {
  fileName: string;
  blob: Blob;
}

const db = new Dexie("PaymentFileDatabase") as Dexie & {
  paymentFiles: EntityTable<PaymentFile, "fileName">;
};

db.version(1).stores({
  paymentFiles: "++fileName, blob",
});

export type { PaymentFile };
export { db };
