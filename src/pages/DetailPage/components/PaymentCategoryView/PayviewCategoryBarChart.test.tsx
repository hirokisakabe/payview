import { describe, expect, test } from "vitest";
import { render } from "@testing-library/react";
import { buildCombinedBarShape, calcBudgetLineY } from "./budgetLineShape";

describe("calcBudgetLineY", () => {
  test("支出 = 予算のとき、バー天井と同じ y を返す", () => {
    expect(calcBudgetLineY(10, 100, 1000, 1000)).toBe(10);
  });

  test("支出が予算の半分のとき、バー中央の y を返す", () => {
    // value=500, budget=1000: budget_y = y + h * (1 - 1000/500) = y + h * (-1) = y - h
    // → バー天井より上（予算の方が高い）
    expect(calcBudgetLineY(10, 50, 500, 1000)).toBe(-40);
  });

  test("支出が予算より多いとき、バー内に y が収まる", () => {
    // value=2000, budget=1000: budget_y = y + h * (1 - 1000/2000) = y + h * 0.5
    expect(calcBudgetLineY(10, 100, 2000, 1000)).toBe(60);
  });
});

describe("buildCombinedBarShape", () => {
  test("budgetがundefinedの場合、rectのみ描画されpathはない", () => {
    const shape = buildCombinedBarShape([{ name: "食費", value: 10000 }]);
    const { container } = render(
      <svg>
        {shape({
          x: 10,
          y: 50,
          width: 60,
          height: 100,
          index: 0,
          fill: "#8B5CF6",
        })}
      </svg>,
    );
    expect(container.querySelector("rect")).not.toBeNull();
    expect(container.querySelector("path")).toBeNull();
  });

  test("budget=0は有効な予算値としてpathを描画する", () => {
    const shape = buildCombinedBarShape([
      { name: "食費", value: 10000, budget: 0 },
    ]);
    const { container } = render(
      <svg>
        {shape({
          x: 10,
          y: 50,
          width: 60,
          height: 100,
          index: 0,
          fill: "#8B5CF6",
        })}
      </svg>,
    );
    expect(container.querySelector("path")).not.toBeNull();
  });

  test("支出が予算を超えている場合は赤色のpathを描画する", () => {
    const shape = buildCombinedBarShape([
      { name: "食費", value: 20000, budget: 15000 },
    ]);
    const { container } = render(
      <svg>
        {shape({
          x: 10,
          y: 50,
          width: 60,
          height: 100,
          index: 0,
          fill: "#8B5CF6",
        })}
      </svg>,
    );
    expect(container.querySelector('path[stroke="#EF4444"]')).not.toBeNull();
  });

  test("支出が予算以下の場合は緑色のpathを描画する", () => {
    const shape = buildCombinedBarShape([
      { name: "食費", value: 10000, budget: 15000 },
    ]);
    const { container } = render(
      <svg>
        {shape({
          x: 10,
          y: 50,
          width: 60,
          height: 100,
          index: 0,
          fill: "#8B5CF6",
        })}
      </svg>,
    );
    expect(container.querySelector('path[stroke="#10B981"]')).not.toBeNull();
  });

  test("x/y/width/height/indexのいずれかがundefinedの場合はnullを返す", () => {
    const shape = buildCombinedBarShape([
      { name: "食費", value: 10000, budget: 15000 },
    ]);
    const { container } = render(
      <svg>
        {shape({ x: undefined, y: 50, width: 60, height: 100, index: 0 })}
      </svg>,
    );
    expect(container.querySelector("rect")).toBeNull();
  });
});
