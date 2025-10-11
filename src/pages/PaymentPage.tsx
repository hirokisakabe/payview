import { usePayments } from "../data/usePayments";
import { PayviewLineChart } from "./components/PayviewLineChart";
import { Tabs } from "./components/Tabs";

type Props = {
  fileName: string;
};

export function PaymentPage({ fileName }: Props) {
  const payments = usePayments({ fileName });

  const chartData = payments.payments
    ? Object.entries(
        Object.groupBy(payments.payments, (item) => item.date),
      ).map(([date, items]) => ({
        name: date,
        value: items ? items.reduce((acc, item) => acc + item.price, 0) : 0,
      }))
    : [];

  return (
    <div className="flex flex-col gap-6">
      <Tabs fileName={fileName} activeTab="payments" />

      {payments.status === "loading" ? (
        <div className="mx-auto w-max">
          <span className="loading loading-spinner loading-xl"></span>
        </div>
      ) : (
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
                {payments.payments.map((item, index) => (
                  <tr key={index}>
                    <td>{item.date}</td>
                    <td>{item.name}</td>
                    <td>{item.price.toLocaleString()} 円</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
