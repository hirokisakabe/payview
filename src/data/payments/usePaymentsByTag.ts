import { useMemo } from "react";
import { usePayments } from "./usePayments";
import { useAllTagRules } from "../tags/useAllTagRules";

type Props = {
  fileName: string;
};

type TagInfo = {
  id: string;
  name: string;
} | null;

type PaymentDetail = {
  name: string;
  date: string;
  price: number;
};

type TagBreakdownItem = {
  tag: TagInfo;
  total: number;
  count: number;
  name?: string;
  payments: PaymentDetail[];
};

type UsePaymentsByTagResult =
  | { status: "loading" }
  | { status: "completed"; breakdown: TagBreakdownItem[] };

export function usePaymentsByTag({ fileName }: Props): UsePaymentsByTagResult {
  const payments = usePayments({ fileName });
  const tagsResult = useAllTagRules();

  const breakdown = useMemo(() => {
    if (payments.status === "loading" || tagsResult.status === "loading") {
      return { status: "loading" as const };
    }

    const { tagsWithRules } = tagsResult;

    const findTagForPayment = (paymentName: string): TagInfo => {
      for (const tag of tagsWithRules) {
        for (const rule of tag.rules) {
          if (paymentName.includes(rule.pattern)) {
            return { id: tag.id, name: tag.name };
          }
        }
      }
      return null;
    };

    const tagTotals = new Map<
      string,
      { tag: TagInfo; total: number; count: number; payments: PaymentDetail[] }
    >();
    const untaggedTotals = new Map<
      string,
      { total: number; count: number; payments: PaymentDetail[] }
    >();

    for (const payment of payments.payments) {
      const tag = findTagForPayment(payment.name);
      const paymentDetail: PaymentDetail = {
        name: payment.name,
        date: payment.date,
        price: payment.price,
      };

      if (tag) {
        const key = tag.id;
        const existing = tagTotals.get(key);
        if (existing) {
          existing.total += payment.price;
          existing.count += 1;
          existing.payments.push(paymentDetail);
        } else {
          tagTotals.set(key, {
            tag,
            total: payment.price,
            count: 1,
            payments: [paymentDetail],
          });
        }
      } else {
        const existing = untaggedTotals.get(payment.name);
        if (existing) {
          existing.total += payment.price;
          existing.count += 1;
          existing.payments.push(paymentDetail);
        } else {
          untaggedTotals.set(payment.name, {
            total: payment.price,
            count: 1,
            payments: [paymentDetail],
          });
        }
      }
    }

    const taggedBreakdown = Array.from(tagTotals.values());
    const untaggedBreakdown: TagBreakdownItem[] = Array.from(
      untaggedTotals.entries(),
    ).map(([name, { total, count, payments }]) => ({
      tag: null,
      total,
      count,
      name,
      payments,
    }));

    const allBreakdown = [...taggedBreakdown, ...untaggedBreakdown];
    allBreakdown.sort((a, b) => b.total - a.total);

    return {
      status: "completed" as const,
      breakdown: allBreakdown,
    };
  }, [payments, tagsResult]);

  return breakdown;
}
