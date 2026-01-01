import { useMemo } from "react";
import { usePayments } from "./usePayments";
import { useAllTagRules } from "./tags/useAllTagRules";

type Props = {
  fileName: string;
};

type TagInfo = {
  id: string;
  name: string;
} | null;

type TagBreakdownItem = {
  tag: TagInfo;
  total: number;
  count: number;
  name?: string;
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
      { tag: TagInfo; total: number; count: number }
    >();
    const untaggedItems: { name: string; total: number }[] = [];
    const untaggedTotals = new Map<string, number>();

    for (const payment of payments.payments) {
      const tag = findTagForPayment(payment.name);

      if (tag) {
        const key = tag.id;
        const existing = tagTotals.get(key);
        if (existing) {
          existing.total += payment.price;
          existing.count += 1;
        } else {
          tagTotals.set(key, { tag, total: payment.price, count: 1 });
        }
      } else {
        const existing = untaggedTotals.get(payment.name);
        if (existing !== undefined) {
          untaggedTotals.set(payment.name, existing + payment.price);
        } else {
          untaggedTotals.set(payment.name, payment.price);
        }
      }
    }

    for (const [name, total] of untaggedTotals) {
      untaggedItems.push({ name, total });
    }

    const taggedBreakdown = Array.from(tagTotals.values());
    taggedBreakdown.sort((a, b) => b.total - a.total);

    untaggedItems.sort((a, b) => b.total - a.total);
    const untaggedBreakdown: TagBreakdownItem[] = untaggedItems.map((item) => ({
      tag: null,
      total: item.total,
      count: 1,
      name: item.name,
    }));

    return {
      status: "completed" as const,
      breakdown: [...taggedBreakdown, ...untaggedBreakdown],
    };
  }, [payments, tagsResult]);

  return breakdown;
}
