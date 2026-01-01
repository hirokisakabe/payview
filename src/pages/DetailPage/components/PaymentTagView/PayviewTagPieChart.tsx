import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

type Props = {
  data: { name: string; value: number }[];
};

const COLORS = ["#8B5CF6", "#06B6D4", "#10B981", "#F59E0B", "#EF4444"];

export function PayviewTagPieChart({ data }: Props) {
  return (
    <div className="max-w-full">
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            outerRadius={100}
            startAngle={90}
            endAngle={-270}
          >
            {data.map((item, index) => (
              <Cell key={item.name} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip
            formatter={(
              value: number,
              _name: string,
              props: { payload?: { name: string; value: number } },
            ) => [`${value.toLocaleString()} 円`, props.payload?.name ?? ""]}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
