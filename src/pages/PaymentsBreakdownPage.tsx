import { usePaymentsBreakdown } from "../data/usePaymentsBreakdown";
import { Tabs } from "./components/Tabs";
import { PieChart, Pie, Cell, Tooltip, Legend } from "recharts";

type Props = {
  fileName: string;
};

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];

export function PaymentsBreakdownPage({ fileName }: Props) {
  const paymentsBreakdown = usePaymentsBreakdown({ fileName });
  const chartData =
    paymentsBreakdown.breakdown?.slice(0, 10).map((item) => ({
      name: item.name,
      value: item.total,
    })) || [];

  return (
    <>
      <Tabs fileName={fileName} activeTab="breakdown" />

      {paymentsBreakdown.status === "loading" ? (
        <div className="mx-auto w-max">
          <span className="loading loading-spinner loading-xl"></span>
        </div>
      ) : (
        <>
          <PieChart width={730} height={250}>
            <Pie
              data={chartData}
              dataKey="value"
              nameKey="name"
              innerRadius={60}
              outerRadius={80}
              fill="#8884d8"
              label
              paddingAngle={5}
            >
              {chartData.map((entry, index) => (
                <Cell
                  key={`cell-${entry.name}`}
                  fill={COLORS[index % COLORS.length]}
                />
              ))}
            </Pie>
          </PieChart>

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
        </>
      )}
    </>
  );
}
