import { useMemo } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "../db";

type MonthlyBudgetSummaryItem = {
  categoryId: string;
  categoryName: string;
  monthlyBudget: number | undefined;
  fileTotal: number;
  remaining: number | undefined;
};

type UseMonthlyBudgetSummaryResult =
  | { status: "loading" }
  | { status: "completed"; items: MonthlyBudgetSummaryItem[] };

function normalizeSpaces(s: string): string {
  return s.replace(/　/g, " ").replace(/\s+/g, " ");
}

export function useMonthlyBudgetSummary({
  fileName,
}: {
  fileName: string;
}): UseMonthlyBudgetSummaryResult {
  const data = useLiveQuery(async () => {
    const paymentFile = await db.paymentFiles.get(fileName);
    const categories = await db.categories.orderBy("order").toArray();
    const allRules = await db.categoryRules.toArray();
    return { paymentFile, categories, allRules };
  }, [fileName]);

  return useMemo(() => {
    if (!data) return { status: "loading" as const };

    const { paymentFile, categories, allRules } = data;

    if (!paymentFile) return { status: "completed" as const, items: [] };

    const categoryRulesMap = new Map<string, string[]>();
    for (const rule of allRules) {
      const patterns = categoryRulesMap.get(rule.categoryId) ?? [];
      patterns.push(rule.pattern);
      categoryRulesMap.set(rule.categoryId, patterns);
    }

    const findCategoryId = (paymentName: string): string | null => {
      for (const category of categories) {
        const patterns = categoryRulesMap.get(category.id) ?? [];
        for (const pattern of patterns) {
          if (normalizeSpaces(paymentName).includes(normalizeSpaces(pattern))) {
            return category.id;
          }
        }
      }
      return null;
    };

    const fileTotals = new Map<string, number>();
    for (const payment of paymentFile.payments) {
      const categoryId = findCategoryId(payment.name);
      if (!categoryId) continue;
      fileTotals.set(
        categoryId,
        (fileTotals.get(categoryId) ?? 0) + payment.price,
      );
    }

    const items: MonthlyBudgetSummaryItem[] = [];

    for (const category of categories) {
      const hasMonthlyBudget = category.monthlyBudget !== undefined;
      const hasSpending = fileTotals.has(category.id);

      if (!hasMonthlyBudget && !hasSpending) continue;

      const fileTotal = fileTotals.get(category.id) ?? 0;

      items.push({
        categoryId: category.id,
        categoryName: category.name,
        monthlyBudget: category.monthlyBudget,
        fileTotal,
        remaining: hasMonthlyBudget
          ? category.monthlyBudget! - fileTotal
          : undefined,
      });
    }

    return { status: "completed" as const, items };
  }, [data]);
}
