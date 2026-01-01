import { ResultAsync } from "neverthrow";
import { db } from "../db";
import { getNextOrder } from "../utils/getNextOrder";

type Input = { tagId: string; pattern: string };
type Output = string;

export function addTagRule(input: Input): ResultAsync<Output, AddTagRuleError> {
  return ResultAsync.fromPromise(
    (async () => {
      const id = crypto.randomUUID();
      const order = await getNextOrder("tagRules", {
        where: "tagId",
        equals: input.tagId,
      });

      await db.tagRules.add({
        id,
        tagId: input.tagId,
        pattern: input.pattern,
        order,
      });

      return id;
    })(),
    (err) =>
      new AddTagRuleError("ルールの追加に失敗しました。", { cause: err }),
  );
}

export class AddTagRuleError extends Error {
  override readonly name = "AddTagRuleError" as const;
  constructor(message: string, options?: { cause: unknown }) {
    super(message, options);
    this.cause = options?.cause;
  }
}
