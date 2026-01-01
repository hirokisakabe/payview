import { ResultAsync } from "neverthrow";
import { db } from "../db";

type Input = { id: string };
type Output = undefined;

export function deleteCategoryRule(
  input: Input,
): ResultAsync<Output, DeleteCategoryRuleError> {
  return ResultAsync.fromPromise(
    (async () => {
      await db.categoryRules.delete(input.id);
      return undefined;
    })(),
    (err) =>
      new DeleteCategoryRuleError("ルールの削除に失敗しました。", {
        cause: err,
      }),
  );
}

export class DeleteCategoryRuleError extends Error {
  override readonly name = "DeleteCategoryRuleError" as const;
  constructor(message: string, options?: { cause: unknown }) {
    super(message, options);
    this.cause = options?.cause;
  }
}
