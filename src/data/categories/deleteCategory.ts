import { db } from "../db";

type Input = { id: string };

export async function deleteCategory(input: Input): Promise<void> {
  await db.transaction("rw", [db.categories, db.categoryRules], async () => {
    await db.categoryRules.where("categoryId").equals(input.id).delete();
    await db.categories.delete(input.id);
  });
}
