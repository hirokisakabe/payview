type DataItem = {
  name: string;
  value: number;
  budget?: number;
};

type BudgetLineShapeProps = {
  x?: number;
  y?: number;
  width?: number;
  index?: number;
  [key: string]: unknown;
};

export function buildBudgetLineShape(data: DataItem[]) {
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
    if (item?.budget === undefined) return null;
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
