import { db } from "../db";
import { getNextOrder } from "../utils/getNextOrder";

type Input = { categoryId: string; pattern: string };

export async function addCategoryRule(input: Input): Promise<string> {
  const id = crypto.randomUUID();
  const order = await getNextOrder("categoryRules", {
    where: "categoryId",
    equals: input.categoryId,
  });

  await db.categoryRules.add({
    id,
    categoryId: input.categoryId,
    pattern: input.pattern,
    order,
  });

  return id;
}
