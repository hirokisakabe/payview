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
    throw new AddCategoryError("カテゴリの追加に失敗しました。", {
      cause: err,
    });
  }
}

export class AddCategoryError extends Error {
  override readonly name = "AddCategoryError" as const;
  constructor(message: string, options?: { cause: unknown }) {
    super(message, options);
    this.cause = options?.cause;
  }
}
