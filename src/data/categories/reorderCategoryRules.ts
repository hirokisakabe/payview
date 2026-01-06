import { db } from "../db";

type Input = { ruleIds: string[] };

export async function reorderCategoryRules(input: Input): Promise<void> {
  try {
    await db.transaction("rw", db.categoryRules, async () => {
      for (let i = 0; i < input.ruleIds.length; i++) {
        await db.categoryRules.update(input.ruleIds[i], { order: i });
      }
    });
  } catch (err) {
    throw new ReorderCategoryRulesError("ルールの並び替えに失敗しました。", {
      cause: err,
    });
  }
}

export class ReorderCategoryRulesError extends Error {
  override readonly name = "ReorderCategoryRulesError" as const;
  constructor(message: string, options?: { cause: unknown }) {
    super(message, options);
    this.cause = options?.cause;
  }
}
