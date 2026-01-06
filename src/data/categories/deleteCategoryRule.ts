import { db } from "../db";

type Input = { id: string };

export async function deleteCategoryRule(input: Input): Promise<void> {
  await db.categoryRules.delete(input.id);
}
