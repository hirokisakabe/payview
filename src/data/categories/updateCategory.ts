import { ResultAsync } from "neverthrow";
import { db } from "../db";

type Input = { id: string; name: string };
type Output = undefined;

export function updateCategory(
  input: Input,
): ResultAsync<Output, UpdateCategoryError> {
  return ResultAsync.fromPromise(
    (async () => {
      await db.categories.update(input.id, { name: input.name });
      return undefined;
    })(),
    (err) =>
      new UpdateCategoryError("カテゴリの更新に失敗しました。", { cause: err }),
  );
}

export class UpdateCategoryError extends Error {
  override readonly name = "UpdateCategoryError" as const;
  constructor(message: string, options?: { cause: unknown }) {
    super(message, options);
    this.cause = options?.cause;
  }
}
