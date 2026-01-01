import {
  LineChart,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Line,
} from "recharts";
import type { PaymentFile } from "../../../data";

type Props = {
  files: PaymentFile[];
};

export function MonthlyTotalChart({ files }: Props) {
  const chartData = files
    .map((file) => ({
      name: file.fileName,
      value: file.payments.reduce((acc, p) => acc + p.price, 0),
    }))
    .sort((a, b) => a.name.localeCompare(b.name));

  if (chartData.length === 0) {
    return null;
  }

  return (
    <div className="max-w-full">
      <ResponsiveContainer width="100%" height={300}>
        <LineChart width={1000} height={250} data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip formatter={(value) => [`¥${value.toLocaleString()}`]} />
          <Line
            type="monotone"
            dataKey="value"
            name="合計金額"
            stroke="#8884d8"
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
