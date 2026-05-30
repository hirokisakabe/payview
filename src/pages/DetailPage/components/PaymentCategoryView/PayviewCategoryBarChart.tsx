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

import { DEFAULT_CATEGORY_COLORS } from "../../../../data/categories/categoryColors";
import { buildBudgetLineShape } from "./budgetLineShape";

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
  const BudgetLineShape = useMemo(() => buildBudgetLineShape(data), [data]);

  return (
    <div className="max-w-full">
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip
            formatter={(value: number, name: string) =>
              name === "budget"
                ? [formatYen(value), "月予算"]
                : [formatYen(value), "金額"]
            }
          />
          <Bar dataKey="value">
            {data.map((item, index) => (
              <Cell
                key={item.name}
                fill={
                  item.color ??
                  DEFAULT_CATEGORY_COLORS[
                    index % DEFAULT_CATEGORY_COLORS.length
                  ]
                }
              />
            ))}
          </Bar>
          <Bar
            dataKey="budget"
            // @ts-expect-error Recharts shape accepts function components at runtime
            shape={BudgetLineShape}
            isAnimationActive={false}
            legendType="none"
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
