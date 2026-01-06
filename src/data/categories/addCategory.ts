import { db } from "../db";
import { getNextOrder } from "../utils/getNextOrder";

type Input = { name: string };

export async function addCategory(input: Input): Promise<string> {
  try {
    const id = crypto.randomUUID();
    const order = await getNextOrder("categories");

    await db.categories.add({
      id,
      name: input.name,
      order,
    });

    return id;
  } catch (err) {
    throw new Error("カテゴリの追加に失敗しました。", { cause: err });
  }
}
