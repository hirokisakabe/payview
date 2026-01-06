import { db } from "../db";

type Input = { id: string; pattern: string };

export async function updateCategoryRule(input: Input): Promise<void> {
  try {
    await db.categoryRules.update(input.id, { pattern: input.pattern });
  } catch (err) {
    throw new Error("ルールの更新に失敗しました。", { cause: err });
  }
}
