import { ResultAsync } from "neverthrow";
import { db } from "../db";

type Input = { id: string; pattern: string };
type Output = undefined;

export function updateTagRule(
  input: Input,
): ResultAsync<Output, UpdateTagRuleError> {
  return ResultAsync.fromPromise(
    (async () => {
      await db.tagRules.update(input.id, { pattern: input.pattern });
      return undefined;
    })(),
    (err) =>
      new UpdateTagRuleError("ルールの更新に失敗しました。", { cause: err }),
  );
}

export class UpdateTagRuleError extends Error {
  override readonly name = "UpdateTagRuleError" as const;
  constructor(message: string, options?: { cause: unknown }) {
    super(message, options);
    this.cause = options?.cause;
  }
}
