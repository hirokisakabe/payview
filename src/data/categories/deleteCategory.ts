import { db } from "../db";

type Input = { id: string };

export async function deleteCategory(input: Input): Promise<void> {
  try {
    await db.transaction("rw", [db.categories, db.categoryRules], async () => {
      await db.categoryRules.where("categoryId").equals(input.id).delete();
      await db.categories.delete(input.id);
    });
  } catch (err) {
    throw new Error("カテゴリの削除に失敗しました。", { cause: err });
  }
}
