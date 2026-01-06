import { db } from "../db";

type Input = { id: string; pattern: string };

export async function updateCategoryRule(input: Input): Promise<void> {
  try {
    await db.categoryRules.update(input.id, { pattern: input.pattern });
  } catch (err) {
    throw new UpdateCategoryRuleError("ルールの更新に失敗しました。", {
      cause: err,
    });
  }
}

export class UpdateCategoryRuleError extends Error {
  override readonly name = "UpdateCategoryRuleError" as const;
  constructor(message: string, options?: { cause: unknown }) {
    super(message, options);
    this.cause = options?.cause;
  }
}
