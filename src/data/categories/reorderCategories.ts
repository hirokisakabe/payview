import { db } from "../db";

type Input = { categoryIds: string[] };

export async function reorderCategories(input: Input): Promise<void> {
  try {
    await db.transaction("rw", db.categories, async () => {
      for (let i = 0; i < input.categoryIds.length; i++) {
        await db.categories.update(input.categoryIds[i], { order: i });
      }
    });
  } catch (err) {
    throw new ReorderCategoriesError("カテゴリの並び替えに失敗しました。", {
      cause: err,
    });
  }
}

export class ReorderCategoriesError extends Error {
  override readonly name = "ReorderCategoriesError" as const;
  constructor(message: string, options?: { cause: unknown }) {
    super(message, options);
    this.cause = options?.cause;
  }
}
