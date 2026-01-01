import { ResultAsync } from "neverthrow";
import { db } from "../db";

type Input = { ruleIds: string[] };
type Output = undefined;

export function reorderCategoryRules(
  input: Input,
): ResultAsync<Output, ReorderCategoryRulesError> {
  return ResultAsync.fromPromise(
    (async () => {
      await db.transaction("rw", db.categoryRules, async () => {
        for (let i = 0; i < input.ruleIds.length; i++) {
          await db.categoryRules.update(input.ruleIds[i], { order: i });
        }
      });
      return undefined;
    })(),
    (err) =>
      new ReorderCategoryRulesError("ルールの並び替えに失敗しました。", {
        cause: err,
      }),
  );
}

export class ReorderCategoryRulesError extends Error {
  override readonly name = "ReorderCategoryRulesError" as const;
  constructor(message: string, options?: { cause: unknown }) {
    super(message, options);
    this.cause = options?.cause;
  }
}
