type DataItem = {
  name: string;
  value: number;
  budget?: number;
};

type CombinedBarShapeProps = {
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  index?: number;
  fill?: string;
  [key: string]: unknown;
};

// 予算ラインの y ピクセル位置を計算する。
// バーの geometry (y, height) と spending/budget 値から、Y軸スケールに依存せず導出できる。
// budget_y = y + height * (1 - budget / value)
export function calcBudgetLineY(
  y: number,
  height: number,
  value: number,
  budget: number,
): number {
  return y + height * (1 - budget / value);
}

export function buildCombinedBarShape(data: DataItem[]) {
  return function CombinedBarShape({
    x,
    y,
    width,
    height,
    index,
    fill,
  }: CombinedBarShapeProps) {
    if (
      x === undefined ||
      y === undefined ||
      width === undefined ||
      height === undefined ||
      index === undefined
    )
      return null;

    const item = data[index];
    if (!item) return null;

    const { budget, value } = item;
    const budgetY =
      budget !== undefined && value > 0
        ? calcBudgetLineY(y, height, value, budget)
        : null;
    const isOverBudget = budget !== undefined && value > budget;
    const stroke = isOverBudget ? "#EF4444" : "#10B981";

    return (
      <g>
        <rect x={x} y={y} width={width} height={height} fill={fill} />
        {budgetY !== null && (
          <path
            d={`M${x},${budgetY} L${x + width},${budgetY}`}
            stroke={stroke}
            strokeWidth={2}
            strokeDasharray="4 2"
            fill="none"
          />
        )}
      </g>
    );
  };
}
