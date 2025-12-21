import { usePaymentsMonthlyBreakdown } from "../../../../data/usePaymentsMonthlyBreakdown";
import { MonthlyBarChart } from "./MonthlyBarChart";

type Props = {
  fileName: string;
};

export function MonthlyBreakdownView({ fileName }: Props) {
  const monthlyBreakdown = usePaymentsMonthlyBreakdown({ fileName });

  const chartData =
    monthlyBreakdown.breakdown?.map((item) => ({
      name: item.month,
      value: item.total,
    })) || [];

  const grandTotal =
    monthlyBreakdown.breakdown?.reduce((acc, item) => acc + item.total, 0) || 0;

  switch (monthlyBreakdown.status) {
    case "loading":
      return (
        <div className="mx-auto w-max">
          <span className="loading loading-spinner loading-xl"></span>
        </div>
      );

    case "completed":
      return (
        <div className="flex flex-col gap-2">
          <h3 className="text-secondary-content text-lg">月別推移</h3>
          <MonthlyBarChart data={chartData} />

          <h3 className="text-secondary-content text-lg">月別合計</h3>
          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr>
                  <th>月</th>
                  <th>金額</th>
                </tr>
              </thead>
              <tbody>
                {monthlyBreakdown.breakdown.map((item, index) => (
                  <tr key={index}>
                    <td>{item.month}</td>
                    <td>{item.total.toLocaleString()} 円</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="font-bold">
                  <td>合計</td>
                  <td>{grandTotal.toLocaleString()} 円</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      );
  }
}
