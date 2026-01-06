import { db } from "../db";

type Input = { id: string };

export async function deleteCategoryRule(input: Input): Promise<void> {
  try {
    await db.categoryRules.delete(input.id);
  } catch (err) {
    throw new DeleteCategoryRuleError("ルールの削除に失敗しました。", {
      cause: err,
    });
  }
}

export class DeleteCategoryRuleError extends Error {
  override readonly name = "DeleteCategoryRuleError" as const;
  constructor(message: string, options?: { cause: unknown }) {
    super(message, options);
    this.cause = options?.cause;
  }
}
