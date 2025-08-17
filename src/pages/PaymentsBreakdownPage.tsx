import { usePaymentsBreakdown } from "../data/usePaymentsBreakdown";
import { Tabs } from "./components/Tabs";
import { PieChart, Pie, Cell, Tooltip, Legend } from "recharts";

type Props = {
  fileName: string;
};

const data01 = [
  {
    name: "Group A",
    value: 400,
  },
  {
    name: "Group B",
    value: 300,
  },
  {
    name: "Group C",
    value: 300,
  },
  {
    name: "Group D",
    value: 200,
  },
  {
    name: "Group E",
    value: 278,
  },
  {
    name: "Group F",
    value: 189,
  },
];

export function PaymentsBreakdownPage({ fileName }: Props) {
  const paymentsBreakdown = usePaymentsBreakdown({ fileName });

  return (
    <>
      <Tabs fileName={fileName} activeTab="breakdown" />

      <PieChart width={730} height={250}>
        <Pie data={data01} dataKey="value" nameKey="name" fill="#8884d8" />
      </PieChart>

      {paymentsBreakdown.status === "loading" ? (
        <div className="mx-auto w-max">
          <span className="loading loading-spinner loading-xl"></span>
        </div>
      ) : (
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
      )}
    </>
  );
}
