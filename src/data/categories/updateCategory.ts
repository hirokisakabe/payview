import { db } from "../db";

type Input = { id: string; name: string };

export async function updateCategory(input: Input): Promise<void> {
  try {
    await db.categories.update(input.id, { name: input.name });
  } catch (err) {
    throw new UpdateCategoryError("カテゴリの更新に失敗しました。", {
      cause: err,
    });
  }
}

export class UpdateCategoryError extends Error {
  override readonly name = "UpdateCategoryError" as const;
  constructor(message: string, options?: { cause: unknown }) {
    super(message, options);
    this.cause = options?.cause;
  }
}
