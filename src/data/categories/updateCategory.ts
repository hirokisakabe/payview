import { db } from "../db";

type Input = { id: string; name: string };

export async function updateCategory(input: Input): Promise<void> {
  try {
    await db.categories.update(input.id, { name: input.name });
  } catch (err) {
    throw new Error("カテゴリの更新に失敗しました。", { cause: err });
  }
}
