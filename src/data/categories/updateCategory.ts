import { db, type Category } from "../db";

type Input = { id: string; name: string; monthlyBudget?: number };

export async function updateCategory(input: Input): Promise<void> {
  const { id, name, monthlyBudget } = input;

  const existing = await db.categories.get(id);
  if (!existing) return;

  const updated: Category = {
    id: existing.id,
    name,
    order: existing.order,
    ...(monthlyBudget !== undefined ? { monthlyBudget } : {}),
  };

  await db.categories.put(updated);
}
