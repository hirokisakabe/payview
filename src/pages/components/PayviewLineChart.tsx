import {
  LineChart,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
  Line,
} from "recharts";

type Props = {
  data: { name: string; value: number }[];
};

export function PayviewLineChart({ data }: Props) {
  return (
    <div className="max-w-full">
      <ResponsiveContainer width="100%" height={300}>
        <LineChart width={1000} height={250} data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip formatter={(value) => [`${value.toLocaleString()} 円`]} />
          <Legend />
          <Line type="monotone" dataKey="value" name="金額" stroke="#8884d8" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
