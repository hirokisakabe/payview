import { db } from "../db";

type Input = { categoryIds: string[] };

export async function reorderCategories(input: Input): Promise<void> {
  await db.transaction("rw", db.categories, async () => {
    for (let i = 0; i < input.categoryIds.length; i++) {
      await db.categories.update(input.categoryIds[i], { order: i });
    }
  });
}
