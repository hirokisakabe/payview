import { db } from "../db";

type Input = { id: string };

export async function deleteCategoryRule(input: Input): Promise<void> {
  try {
    await db.categoryRules.delete(input.id);
  } catch (err) {
    throw new Error("ルールの削除に失敗しました。", { cause: err });
  }
}
