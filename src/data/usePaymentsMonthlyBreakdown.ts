import { useMemo } from "react";
import { usePayments } from "./usePayments";

type Props = {
  fileName: string;
};

export function usePaymentsMonthlyBreakdown({ fileName }: Props) {
  const payments = usePayments({ fileName });

  const breakdown = useMemo(() => {
    if (payments.status === "loading") {
      return { status: "loading" as const };
    }

    const breakdown = payments.payments.reduce(
      (acc, payment) => {
        const { date, price } = payment;
        const month = date.substring(0, 7);
        if (!acc[month]) {
          acc[month] = 0;
        }
        acc[month] += price;
        return acc;
      },
      {} as Record<string, number>,
    );

    const _breakdown = Object.entries(breakdown).map(([month, total]) => ({
      month,
      total,
    }));

    _breakdown.sort((a, b) => {
      return a.month.localeCompare(b.month);
    });

    return { status: "completed" as const, breakdown: _breakdown };
  }, [payments]);

  return breakdown;
}
