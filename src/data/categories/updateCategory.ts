import { db, type Category } from "../db";

type Input = { id: string; name: string; annualBudget?: number };

export async function updateCategory(input: Input): Promise<void> {
  const { id, name, annualBudget } = input;

  const existing = await db.categories.get(id);
  if (!existing) return;

  const updated: Category = {
    id: existing.id,
    name,
    order: existing.order,
    ...(annualBudget !== undefined ? { annualBudget } : {}),
  };

  await db.categories.put(updated);
}
