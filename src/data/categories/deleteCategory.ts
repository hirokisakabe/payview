import { db } from "../db";

type Input = { id: string };

export async function deleteCategory(input: Input): Promise<void> {
  try {
    await db.transaction("rw", [db.categories, db.categoryRules], async () => {
      await db.categoryRules.where("categoryId").equals(input.id).delete();
      await db.categories.delete(input.id);
    });
  } catch (err) {
    throw new DeleteCategoryError("カテゴリの削除に失敗しました。", {
      cause: err,
    });
  }
}

export class DeleteCategoryError extends Error {
  override readonly name = "DeleteCategoryError" as const;
  constructor(message: string, options?: { cause: unknown }) {
    super(message, options);
    this.cause = options?.cause;
  }
}
