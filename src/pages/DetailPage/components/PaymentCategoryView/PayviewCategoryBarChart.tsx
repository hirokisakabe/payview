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

type DataItem = {
  name: string;
  value: number;
  color?: string;
  budget?: number;
};

type Props = {
  data: DataItem[];
};

type BudgetLineShapeProps = {
  x?: number;
  y?: number;
  width?: number;
  index?: number;
  [key: string]: unknown;
};

function buildBudgetLineShape(data: DataItem[]) {
  return function BudgetLineShape({
    x,
    y,
    width,
    index,
  }: BudgetLineShapeProps) {
    if (
      x === undefined ||
      y === undefined ||
      width === undefined ||
      index === undefined
    )
      return null;
    const item = data[index];
    if (!item?.budget) return null;
    const isOverBudget = item.value > item.budget;
    const stroke = isOverBudget ? "#EF4444" : "#10B981";
    return (
      <path
        d={`M${x},${y} L${x + width},${y}`}
        stroke={stroke}
        strokeWidth={2}
        strokeDasharray="4 2"
        fill="none"
      />
    );
  };
}

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
