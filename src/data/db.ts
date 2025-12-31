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

interface Tag {
  id: string;
  name: string;
  order: number;
}

interface TagRule {
  id: string;
  tagId: string;
  pattern: string;
  order: number;
}

const db = new Dexie("PaymentFileDatabase") as Dexie & {
  paymentFiles: EntityTable<PaymentFile, "fileName">;
  tags: EntityTable<Tag, "id">;
  tagRules: EntityTable<TagRule, "id">;
};

db.version(1).stores({
  paymentFiles: "fileName",
});

db.version(2).stores({
  paymentFiles: "fileName",
  tags: "id, order",
  tagRules: "id, tagId, order",
});

export type { PaymentFile, Tag, TagRule };
export { db };
