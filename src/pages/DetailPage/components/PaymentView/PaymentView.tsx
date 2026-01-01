import { usePayments } from "../../../../data/payments";
import { PayviewLineChart } from "./PayviewLineChart";
import { formatYen } from "../../../../utils/formatYen";

type Props = {
  fileName: string;
};

export function PaymentView({ fileName }: Props) {
  const payments = usePayments({ fileName });

  const chartData = payments.payments
    ? Object.entries(
        Object.groupBy(payments.payments, (item) => item.date),
      ).map(([date, items]) => ({
        name: date,
        value: items ? items.reduce((acc, item) => acc + item.price, 0) : 0,
      }))
    : [];

  switch (payments.status) {
    case "loading":
      return (
        <div className="mx-auto w-max">
          <span className="loading loading-spinner loading-xl"></span>
        </div>
      );

    case "completed":
      return (
        <div className="flex flex-col gap-2">
          <h3 className="text-secondary-content text-lg">支払い金額の推移</h3>
          <PayviewLineChart data={chartData} />

          <h3 className="text-secondary-content text-lg">支払い一覧</h3>
          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr>
                  <th>利用日</th>
                  <th>項目</th>
                  <th>金額</th>
                </tr>
              </thead>
              <tbody>
                {payments.payments.map((item) => (
                  <tr key={`${item.date}-${item.name}-${item.price}`}>
                    <td>{item.date}</td>
                    <td>{item.name}</td>
                    <td>{formatYen(item.price)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      );
  }
}
