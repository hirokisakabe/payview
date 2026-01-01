import { ResultAsync } from "neverthrow";
import { db } from "../db";

type Input = { id: string; pattern: string };
type Output = undefined;

export function updateCategoryRule(
  input: Input,
): ResultAsync<Output, UpdateCategoryRuleError> {
  return ResultAsync.fromPromise(
    (async () => {
      await db.categoryRules.update(input.id, { pattern: input.pattern });
      return undefined;
    })(),
    (err) =>
      new UpdateCategoryRuleError("ルールの更新に失敗しました。", {
        cause: err,
      }),
  );
}

export class UpdateCategoryRuleError extends Error {
  override readonly name = "UpdateCategoryRuleError" as const;
  constructor(message: string, options?: { cause: unknown }) {
    super(message, options);
    this.cause = options?.cause;
  }
}
