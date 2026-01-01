import { ResultAsync } from "neverthrow";
import { db } from "../db";

type Input = { id: string };
type Output = undefined;

export function deleteTagRule(
  input: Input,
): ResultAsync<Output, DeleteTagRuleError> {
  return ResultAsync.fromPromise(
    (async () => {
      await db.tagRules.delete(input.id);
      return undefined;
    })(),
    (err) =>
      new DeleteTagRuleError("ルールの削除に失敗しました。", { cause: err }),
  );
}

export class DeleteTagRuleError extends Error {
  override readonly name = "DeleteTagRuleError" as const;
  constructor(message: string, options?: { cause: unknown }) {
    super(message, options);
    this.cause = options?.cause;
  }
}
