import { ResultAsync } from "neverthrow";
import { db } from "../db";

type Input = { categoryIds: string[] };
type Output = undefined;

export function reorderCategories(
  input: Input,
): ResultAsync<Output, ReorderCategoriesError> {
  return ResultAsync.fromPromise(
    (async () => {
      await db.transaction("rw", db.categories, async () => {
        for (let i = 0; i < input.categoryIds.length; i++) {
          await db.categories.update(input.categoryIds[i], { order: i });
        }
      });
      return undefined;
    })(),
    (err) =>
      new ReorderCategoriesError("カテゴリの並び替えに失敗しました。", {
        cause: err,
      }),
  );
}

export class ReorderCategoriesError extends Error {
  override readonly name = "ReorderCategoriesError" as const;
  constructor(message: string, options?: { cause: unknown }) {
    super(message, options);
    this.cause = options?.cause;
  }
}
