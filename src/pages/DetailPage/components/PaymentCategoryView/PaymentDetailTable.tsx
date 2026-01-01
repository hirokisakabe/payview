import { formatYen } from "../../../../utils/formatYen";

type PaymentDetail = {
  name: string;
  date: string;
  price: number;
};

type Props = {
  payments: PaymentDetail[];
};

export function PaymentDetailTable({ payments }: Props) {
  return (
    <div className="bg-base-200 p-2">
      <table className="table-sm table">
        <thead>
          <tr>
            <th>利用日</th>
            <th>項目</th>
            <th>金額</th>
          </tr>
        </thead>
        <tbody>
          {payments.map((payment, idx) => (
            <tr key={`${payment.date}-${payment.name}-${idx}`}>
              <td>{payment.date}</td>
              <td>{payment.name}</td>
              <td>{formatYen(payment.price)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
