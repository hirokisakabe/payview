import { useMemo } from "react";
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
import { buildCombinedBarShape } from "./budgetLineShape";

type DataItem = {
  name: string;
  value: number;
  color?: string;
  budget?: number;
};

type Props = {
  data: DataItem[];
};

export function PayviewCategoryBarChart({ data }: Props) {
  const CombinedBarShape = useMemo(() => buildCombinedBarShape(data), [data]);

  const yMax = useMemo(() => {
    const maxValue = Math.max(...data.map((d) => d.value), 0);
    const maxBudget = Math.max(...data.map((d) => d.budget ?? 0), 0);
    return Math.max(maxValue, maxBudget);
  }, [data]);

  return (
    <div className="max-w-full">
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <XAxis dataKey="name" />
          <YAxis domain={[0, yMax]} />
          <Tooltip formatter={(value: number) => [formatYen(value), "金額"]} />
          <Bar
            dataKey="value"
            // @ts-expect-error Recharts shape accepts function components at runtime
            shape={CombinedBarShape}
          >
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
