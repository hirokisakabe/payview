import { usePayments } from "../../../data/payments/usePayments";

type Props = {
  fileName: string;
};

export function TotalAmount({ fileName }: Props) {
  const payments = usePayments({ fileName });

  if (payments.status === "loading") {
    return null;
  }

  const total = payments.payments.reduce(
    (acc, payment) => acc + payment.price,
    0,
  );

  return (
    <p className="text-secondary-content text-lg">
      合計: {total.toLocaleString()} 円
    </p>
  );
}
