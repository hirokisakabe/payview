import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { formatYen } from "../../../../utils/formatYen";
import { resolveCategoryColor } from "../../../../data/categories/categoryColors";

type Props = {
  data: { name: string; value: number; color?: string }[];
};

export function PayviewCategoryPieChart({ data }: Props) {
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
              <Cell
                key={item.name}
                fill={resolveCategoryColor(item.color, index)}
              />
            ))}
          </Pie>
          <Tooltip
            formatter={(
              value: number,
              _name: string,
              props: { payload?: { name: string; value: number } },
            ) => [formatYen(value), props.payload?.name ?? ""]}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
