import { useMemo } from "react";
import { usePayments } from "./usePayments";
import { useAllCategoryRules } from "../categories/useAllCategoryRules";

type Props = {
  fileName: string;
};

type CategoryInfo = {
  id: string;
  name: string;
} | null;

type PaymentDetail = {
  name: string;
  date: string;
  price: number;
};

type CategoryBreakdownItem = {
  category: CategoryInfo;
  total: number;
  count: number;
  name?: string;
  payments: PaymentDetail[];
};

type UsePaymentsByCategoryResult =
  | { status: "loading" }
  | { status: "completed"; breakdown: CategoryBreakdownItem[] };

export function usePaymentsByCategory({
  fileName,
}: Props): UsePaymentsByCategoryResult {
  const payments = usePayments({ fileName });
  const categoriesResult = useAllCategoryRules();

  const breakdown = useMemo(() => {
    if (
      payments.status === "loading" ||
      categoriesResult.status === "loading"
    ) {
      return { status: "loading" as const };
    }

    const { categoriesWithRules } = categoriesResult;

    const findCategoryForPayment = (paymentName: string): CategoryInfo => {
      for (const category of categoriesWithRules) {
        for (const rule of category.rules) {
          if (paymentName.includes(rule.pattern)) {
            return { id: category.id, name: category.name };
          }
        }
      }
      return null;
    };

    const categoryTotals = new Map<
      string,
      {
        category: CategoryInfo;
        total: number;
        count: number;
        payments: PaymentDetail[];
      }
    >();
    const uncategorizedTotals = new Map<
      string,
      { total: number; count: number; payments: PaymentDetail[] }
    >();

    for (const payment of payments.payments) {
      const category = findCategoryForPayment(payment.name);
      const paymentDetail: PaymentDetail = {
        name: payment.name,
        date: payment.date,
        price: payment.price,
      };

      if (category) {
        const key = category.id;
        const existing = categoryTotals.get(key);
        if (existing) {
          existing.total += payment.price;
          existing.count += 1;
          existing.payments.push(paymentDetail);
        } else {
          categoryTotals.set(key, {
            category,
            total: payment.price,
            count: 1,
            payments: [paymentDetail],
          });
        }
      } else {
        const existing = uncategorizedTotals.get(payment.name);
        if (existing) {
          existing.total += payment.price;
          existing.count += 1;
          existing.payments.push(paymentDetail);
        } else {
          uncategorizedTotals.set(payment.name, {
            total: payment.price,
            count: 1,
            payments: [paymentDetail],
          });
        }
      }
    }

    const categorizedBreakdown = Array.from(categoryTotals.values());
    const uncategorizedBreakdown: CategoryBreakdownItem[] = Array.from(
      uncategorizedTotals.entries(),
    ).map(([name, { total, count, payments }]) => ({
      category: null,
      total,
      count,
      name,
      payments,
    }));

    const allBreakdown = [...categorizedBreakdown, ...uncategorizedBreakdown];
    allBreakdown.sort((a, b) => b.total - a.total);

    return {
      status: "completed" as const,
      breakdown: allBreakdown,
    };
  }, [payments, categoriesResult]);

  return breakdown;
}
