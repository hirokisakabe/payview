import { ResultAsync } from "neverthrow";
import { db } from "../db";

type Input = { ruleIds: string[] };
type Output = undefined;

export function reorderTagRules(
  input: Input,
): ResultAsync<Output, ReorderTagRulesError> {
  return ResultAsync.fromPromise(
    (async () => {
      await db.transaction("rw", db.tagRules, async () => {
        for (let i = 0; i < input.ruleIds.length; i++) {
          await db.tagRules.update(input.ruleIds[i], { order: i });
        }
      });
      return undefined;
    })(),
    (err) =>
      new ReorderTagRulesError("ルールの並び替えに失敗しました。", {
        cause: err,
      }),
  );
}

export class ReorderTagRulesError extends Error {
  override readonly name = "ReorderTagRulesError" as const;
  constructor(message: string, options?: { cause: unknown }) {
    super(message, options);
    this.cause = options?.cause;
  }
}
