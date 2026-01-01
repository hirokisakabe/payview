import { useLiveQuery } from "dexie-react-hooks";
import { db, type Category } from "../db";

type UseCategoriesResult =
  | { status: "loading" }
  | { status: "completed"; categories: Category[] };

export function useCategories(): UseCategoriesResult {
  const categories = useLiveQuery(() =>
    db.categories.orderBy("order").toArray(),
  );

  if (!categories) {
    return { status: "loading" as const };
  }

  return { status: "completed" as const, categories };
}
