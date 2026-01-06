import { db } from "../db";

type Input = { id: string; pattern: string };

export async function updateCategoryRule(input: Input): Promise<void> {
  await db.categoryRules.update(input.id, { pattern: input.pattern });
}
