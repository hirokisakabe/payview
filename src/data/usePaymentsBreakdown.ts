import { useMemo } from "react";
import { usePayments } from "./usePayments";

type Props = {
  fileName: string;
};

export function usePaymentsBreakdown({ fileName }: Props) {
  const payments = usePayments({ fileName });

  const breakdown = useMemo(() => {
    if (payments.status === "loading") {
      return { status: "loading" as const };
    }

    const breakdown = payments.payments.reduce(
      (acc, payment) => {
        const { name, price } = payment;
        if (!acc[name]) {
          acc[name] = 0;
        }
        acc[name] += parseInt(price, 10);
        return acc;
      },
      {} as Record<string, number>
    );

    const _breakdown = Object.entries(breakdown).map(([name, total]) => ({
      name,
      total,
    }));

    _breakdown.sort((a, b) => {
      return b.total - a.total;
    });

    return { status: "completed" as const, breakdown: _breakdown };
  }, [payments]);

  return breakdown;
}
