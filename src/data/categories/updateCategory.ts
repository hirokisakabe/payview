import { db, type Category } from "../db";

type Input = {
  id: string;
  name: string;
  monthlyBudget?: number;
  color?: string;
};

export async function updateCategory(input: Input): Promise<void> {
  const { id, name, monthlyBudget, color } = input;

  const existing = await db.categories.get(id);
  if (!existing) return;

  const updated: Category = {
    id: existing.id,
    name,
    order: existing.order,
    ...(monthlyBudget !== undefined ? { monthlyBudget } : {}),
    ...(color !== undefined
      ? { color }
      : existing.color !== undefined
        ? { color: existing.color }
        : {}),
  };

  await db.categories.put(updated);
}
