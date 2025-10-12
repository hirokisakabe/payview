import { usePaymentsBreakdown } from "../../../../data/usePaymentsBreakdown";
import { PayviewBarChart } from "./PayviewBarChart";

type Props = {
  fileName: string;
};

export function PaymentBreakdownView({ fileName }: Props) {
  const paymentsBreakdown = usePaymentsBreakdown({ fileName });

  const chartData =
    paymentsBreakdown.breakdown?.slice(0, 20).map((item) => ({
      name: item.name,
      value: item.total,
    })) || [];

  return paymentsBreakdown.status === "loading" ? (
    <div className="mx-auto w-max">
      <span className="loading loading-spinner loading-xl"></span>
    </div>
  ) : (
    <div className="flex flex-col gap-2">
      <h3 className="text-secondary-content text-lg">上位20件</h3>
      <PayviewBarChart data={chartData} />

      <h3 className="text-secondary-content text-lg">内訳</h3>
      <div className="overflow-x-auto">
        <table className="table">
          <thead>
            <tr>
              <th>項目</th>
              <th>金額</th>
            </tr>
          </thead>
          <tbody>
            {paymentsBreakdown.breakdown.map((item, index) => (
              <tr key={index}>
                <td>{item.name}</td>
                <td>{item.total.toLocaleString()} 円</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
