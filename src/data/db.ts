import Dexie, { type EntityTable } from "dexie";

type Payment = {
  name: string;
  date: string;
  price: number;
  count: number;
};

interface PaymentFile {
  fileName: string;
  payments: Payment[];
}

const db = new Dexie("PaymentFileDatabase") as Dexie & {
  paymentFiles: EntityTable<PaymentFile, "fileName">;
};

db.version(1).stores({
  paymentFiles: "fileName",
});

export type { PaymentFile };
export { db };
