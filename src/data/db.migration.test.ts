import { beforeEach, expect, test } from "vitest";
import Dexie, { type EntityTable } from "dexie";

type CategoryV4 = {
  id: string;
  name: string;
  order: number;
  color?: string;
};

type TestDB = Dexie & {
  categories: EntityTable<CategoryV4, "id">;
  categoryRules: EntityTable<{ id: string }, "id">;
  paymentFiles: EntityTable<{ fileName: string }, "fileName">;
};

const V5_MIGRATION_COLORS = [
  "#8B5CF6",
  "#06B6D4",
  "#10B981",
  "#F59E0B",
  "#EF4444",
  "#3B82F6",
  "#EC4899",
  "#84CC16",
  "#F97316",
  "#6366F1",
];

let dbName: string;

beforeEach(() => {
  dbName = `test-migration-${Date.now()}-${Math.random()}`;
});

async function createV4Database(name: string) {
  const db = new Dexie(name);
  db.version(1).stores({ paymentFiles: "fileName" });
  db.version(2).stores({
    paymentFiles: "fileName",
    tags: "id, order",
    tagRules: "id, tagId, order",
  });
  db.version(3).stores({
    paymentFiles: "fileName",
    categories: "id, order",
    categoryRules: "id, categoryId, order",
    tags: null,
    tagRules: null,
  });
  db.version(4).stores({
    paymentFiles: "fileName",
    categories: "id, order",
    categoryRules: "id, categoryId, order",
  });
  await db.open();
  return db;
}

async function openV5Database(name: string) {
  const db = new Dexie(name);
  db.version(1).stores({ paymentFiles: "fileName" });
  db.version(2).stores({
    paymentFiles: "fileName",
    tags: "id, order",
    tagRules: "id, tagId, order",
  });
  db.version(3).stores({
    paymentFiles: "fileName",
    categories: "id, order",
    categoryRules: "id, categoryId, order",
    tags: null,
    tagRules: null,
  });
  db.version(4).stores({
    paymentFiles: "fileName",
    categories: "id, order",
    categoryRules: "id, categoryId, order",
  });
  db.version(5)
    .stores({
      paymentFiles: "fileName",
      categories: "id, order",
      categoryRules: "id, categoryId, order",
    })
    .upgrade(async (tx) => {
      const categories = await tx
        .table("categories")
        .orderBy("order")
        .toArray();
      await tx.table("categories").bulkPut(
        categories.map(
          (cat: { color?: string; [key: string]: unknown }, index: number) =>
            cat.color === undefined
              ? {
                  ...cat,
                  color:
                    V5_MIGRATION_COLORS[index % V5_MIGRATION_COLORS.length],
                }
              : cat,
        ),
      );
    });
  await db.open();
  return db;
}

test("v5マイグレーション: colorのないカテゴリに順序ベースで色が割り当てられる", async () => {
  const dbV4 = await createV4Database(dbName);
  await (dbV4 as unknown as TestDB).categories.bulkAdd([
    { id: "cat-1", name: "食費", order: 0 },
    { id: "cat-2", name: "交通費", order: 1 },
    { id: "cat-3", name: "趣味", order: 2 },
  ]);
  dbV4.close();

  const dbV5 = await openV5Database(dbName);
  const categories = await (dbV5 as unknown as TestDB).categories
    .orderBy("order")
    .toArray();

  expect(categories[0].color).toBe(V5_MIGRATION_COLORS[0]);
  expect(categories[1].color).toBe(V5_MIGRATION_COLORS[1]);
  expect(categories[2].color).toBe(V5_MIGRATION_COLORS[2]);

  dbV5.close();
});

test("v5マイグレーション: 既にcolorを持つカテゴリは上書きされない", async () => {
  const dbV4 = await createV4Database(dbName);
  await (dbV4 as unknown as TestDB).categories.bulkAdd([
    { id: "cat-1", name: "食費", order: 0, color: "#FF0000" },
    { id: "cat-2", name: "交通費", order: 1 },
  ]);
  dbV4.close();

  const dbV5 = await openV5Database(dbName);
  const categories = await (dbV5 as unknown as TestDB).categories
    .orderBy("order")
    .toArray();

  expect(categories[0].color).toBe("#FF0000");
  expect(categories[1].color).toBe(V5_MIGRATION_COLORS[1]);

  dbV5.close();
});

test("v5マイグレーション: カテゴリが10件を超えるとカラーパレットがサイクルする", async () => {
  const dbV4 = await createV4Database(dbName);
  const items = Array.from({ length: 12 }, (_, i) => ({
    id: `cat-${i}`,
    name: `カテゴリ${i}`,
    order: i,
  }));
  await (dbV4 as unknown as TestDB).categories.bulkAdd(items);
  dbV4.close();

  const dbV5 = await openV5Database(dbName);
  const categories = await (dbV5 as unknown as TestDB).categories
    .orderBy("order")
    .toArray();

  expect(categories[10].color).toBe(V5_MIGRATION_COLORS[0]);
  expect(categories[11].color).toBe(V5_MIGRATION_COLORS[1]);

  dbV5.close();
});
