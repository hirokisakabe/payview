import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
  ResponsiveContainer,
} from "recharts";
import { formatYen } from "../../../../utils/formatYen";

import { resolveCategoryColor } from "../../../../data/categories/categoryColors";

type Props = {
  data: { name: string; value: number; color?: string }[];
};

export function PayviewCategoryBarChart({ data }: Props) {
  return (
    <div className="max-w-full">
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip formatter={(value: number) => [formatYen(value), "金額"]} />
          <Bar dataKey="value">
            {data.map((item, index) => (
              <Cell
                key={item.name}
                fill={resolveCategoryColor(item.color, index)}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
