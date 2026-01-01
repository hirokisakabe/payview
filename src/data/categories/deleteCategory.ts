import { ResultAsync } from "neverthrow";
import { db } from "../db";

type Input = { id: string };
type Output = undefined;

export function deleteCategory(
  input: Input,
): ResultAsync<Output, DeleteCategoryError> {
  return ResultAsync.fromPromise(
    (async () => {
      await db.transaction(
        "rw",
        [db.categories, db.categoryRules],
        async () => {
          await db.categoryRules.where("categoryId").equals(input.id).delete();
          await db.categories.delete(input.id);
        },
      );
      return undefined;
    })(),
    (err) =>
      new DeleteCategoryError("カテゴリの削除に失敗しました。", { cause: err }),
  );
}

export class DeleteCategoryError extends Error {
  override readonly name = "DeleteCategoryError" as const;
  constructor(message: string, options?: { cause: unknown }) {
    super(message, options);
    this.cause = options?.cause;
  }
}
