import { ResultAsync } from "neverthrow";
import { db } from "../db";
import { getNextOrder } from "../utils/getNextOrder";

type Input = { categoryId: string; pattern: string };
type Output = string;

export function addCategoryRule(
  input: Input,
): ResultAsync<Output, AddCategoryRuleError> {
  return ResultAsync.fromPromise(
    (async () => {
      const id = crypto.randomUUID();
      const order = await getNextOrder("categoryRules", {
        where: "categoryId",
        equals: input.categoryId,
      });

      await db.categoryRules.add({
        id,
        categoryId: input.categoryId,
        pattern: input.pattern,
        order,
      });

      return id;
    })(),
    (err) =>
      new AddCategoryRuleError("ルールの追加に失敗しました。", { cause: err }),
  );
}

export class AddCategoryRuleError extends Error {
  override readonly name = "AddCategoryRuleError" as const;
  constructor(message: string, options?: { cause: unknown }) {
    super(message, options);
    this.cause = options?.cause;
  }
}
