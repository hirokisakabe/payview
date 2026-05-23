import { useMemo } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "../db";

type AnnualBudgetSummaryItem = {
  categoryId: string;
  categoryName: string;
  annualBudget: number;
  isFallback: boolean;
  currentYearTotal: number;
  remaining: number;
};

type UseAnnualBudgetSummaryResult =
  | { status: "loading" }
  | { status: "completed"; items: AnnualBudgetSummaryItem[] };

function normalizeSpaces(s: string): string {
  return s.replace(/\u3000/g, " ").replace(/\s+/g, " ");
}

export function useAnnualBudgetSummary(): UseAnnualBudgetSummaryResult {
  const data = useLiveQuery(async () => {
    const paymentFiles = await db.paymentFiles.toArray();
    const categories = await db.categories.orderBy("order").toArray();
    const allRules = await db.categoryRules.toArray();
    return { paymentFiles, categories, allRules };
  });

  return useMemo(() => {
    if (!data) return { status: "loading" as const };

    const { paymentFiles, categories, allRules } = data;
    const currentYear = new Date().getFullYear().toString();

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

    const categoryStats = new Map<
      string,
      { currentYearTotal: number; allTimeTotal: number; months: Set<string> }
    >();

    for (const file of paymentFiles) {
      for (const payment of file.payments) {
        const categoryId = findCategoryId(payment.name);
        if (!categoryId) continue;

        const stats = categoryStats.get(categoryId) ?? {
          currentYearTotal: 0,
          allTimeTotal: 0,
          months: new Set<string>(),
        };

        stats.allTimeTotal += payment.price;
        stats.months.add(payment.date.substring(0, 7));

        if (payment.date.startsWith(currentYear)) {
          stats.currentYearTotal += payment.price;
        }

        categoryStats.set(categoryId, stats);
      }
    }

    const items: AnnualBudgetSummaryItem[] = [];

    for (const category of categories) {
      const stats = categoryStats.get(category.id);
      const hasAnnualBudget = category.annualBudget !== undefined;
      const hasSpending = stats !== undefined;

      if (!hasAnnualBudget && !hasSpending) continue;

      const currentYearTotal = stats?.currentYearTotal ?? 0;
      let annualBudget: number;
      let isFallback: boolean;

      if (hasAnnualBudget) {
        annualBudget = category.annualBudget!;
        isFallback = false;
      } else if (stats && stats.months.size > 0) {
        const monthlyAvg = stats.allTimeTotal / stats.months.size;
        annualBudget = Math.round(monthlyAvg * 12);
        isFallback = true;
      } else {
        continue;
      }

      items.push({
        categoryId: category.id,
        categoryName: category.name,
        annualBudget,
        isFallback,
        currentYearTotal,
        remaining: annualBudget - currentYearTotal,
      });
    }

    return { status: "completed" as const, items };
  }, [data]);
}
