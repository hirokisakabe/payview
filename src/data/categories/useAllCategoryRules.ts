import { useLiveQuery } from "dexie-react-hooks";
import { db, type Category, type CategoryRule } from "../db";

type CategoryWithRules = Category & {
  rules: CategoryRule[];
};

type UseAllCategoryRulesResult =
  | { status: "loading" }
  | { status: "completed"; categoriesWithRules: CategoryWithRules[] };

export function useAllCategoryRules(): UseAllCategoryRulesResult {
  const result = useLiveQuery(async () => {
    const categories = await db.categories.orderBy("order").toArray();
    const allRules = await db.categoryRules.toArray();

    const categoriesWithRules: CategoryWithRules[] = categories.map(
      (category) => ({
        ...category,
        rules: allRules
          .filter((rule) => rule.categoryId === category.id)
          .sort((a, b) => a.order - b.order),
      }),
    );

    return categoriesWithRules;
  });

  if (!result) {
    return { status: "loading" as const };
  }

  return { status: "completed" as const, categoriesWithRules: result };
}
