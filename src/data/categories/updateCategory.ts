import { db } from "../db";

type Input = { id: string; name: string };

export async function updateCategory(input: Input): Promise<void> {
  await db.categories.update(input.id, { name: input.name });
}
