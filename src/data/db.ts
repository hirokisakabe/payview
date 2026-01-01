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

interface Category {
  id: string;
  name: string;
  order: number;
}

interface CategoryRule {
  id: string;
  categoryId: string;
  pattern: string;
  order: number;
}

const db = new Dexie("PaymentFileDatabase") as Dexie & {
  paymentFiles: EntityTable<PaymentFile, "fileName">;
  categories: EntityTable<Category, "id">;
  categoryRules: EntityTable<CategoryRule, "id">;
};

db.version(1).stores({
  paymentFiles: "fileName",
});

db.version(2).stores({
  paymentFiles: "fileName",
  tags: "id, order",
  tagRules: "id, tagId, order",
});

db.version(3)
  .stores({
    paymentFiles: "fileName",
    categories: "id, order",
    categoryRules: "id, categoryId, order",
    tags: null,
    tagRules: null,
  })
  .upgrade(async (tx) => {
    const oldTags = await tx.table("tags").toArray();
    const oldTagRules = await tx.table("tagRules").toArray();

    await tx.table("categories").bulkAdd(oldTags);
    await tx.table("categoryRules").bulkAdd(
      oldTagRules.map((rule: { tagId: string }) => ({
        ...rule,
        categoryId: rule.tagId,
      })),
    );
  });

export type { Payment, PaymentFile, Category, CategoryRule };
export { db };
