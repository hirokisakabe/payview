import { db } from "../db";

type Input = { ruleIds: string[] };

export async function reorderCategoryRules(input: Input): Promise<void> {
  await db.transaction("rw", db.categoryRules, async () => {
    for (let i = 0; i < input.ruleIds.length; i++) {
      await db.categoryRules.update(input.ruleIds[i], { order: i });
    }
  });
}
