import { useLiveQuery } from "dexie-react-hooks";
import { db, type CategoryRule } from "../db";

type Props = {
  categoryId: string;
};

type UseCategoryRulesResult =
  | { status: "loading" }
  | { status: "completed"; rules: CategoryRule[] };

export function useCategoryRules({
  categoryId,
}: Props): UseCategoryRulesResult {
  const rules = useLiveQuery(
    () =>
      db.categoryRules.where("categoryId").equals(categoryId).sortBy("order"),
    [categoryId],
  );

  if (!rules) {
    return { status: "loading" as const };
  }

  return { status: "completed" as const, rules };
}
