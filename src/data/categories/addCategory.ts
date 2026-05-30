import { db } from "../db";
import { getNextOrder } from "../utils/getNextOrder";
import { getDefaultColor } from "./categoryColors";

type Input = { name: string; color?: string };

export async function addCategory(input: Input): Promise<string> {
  const id = crypto.randomUUID();
  const order = await getNextOrder("categories");
  const color = input.color ?? getDefaultColor(order);

  await db.categories.add({
    id,
    name: input.name,
    order,
    color,
  });

  return id;
}
