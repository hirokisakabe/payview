import { describe, expect, test } from "vitest";
import { render } from "@testing-library/react";
import { buildBudgetLineShape } from "./budgetLineShape";

describe("buildBudgetLineShape", () => {
  test("budgetがundefinedの場合はnullを返す", () => {
    const shape = buildBudgetLineShape([{ name: "食費", value: 10000 }]);
    const { container } = render(
      <svg>{shape({ x: 10, y: 50, width: 60, index: 0 })}</svg>,
    );
    expect(container.querySelector("path")).toBeNull();
  });

  test("budget=0は有効な予算値として扱い、ラインを描画する", () => {
    const shape = buildBudgetLineShape([
      { name: "食費", value: 10000, budget: 0 },
    ]);
    const { container } = render(
      <svg>{shape({ x: 10, y: 50, width: 60, index: 0 })}</svg>,
    );
    expect(container.querySelector("path")).not.toBeNull();
  });

  test("支出が予算を超えている場合は赤色のラインを返す", () => {
    const shape = buildBudgetLineShape([
      { name: "食費", value: 20000, budget: 15000 },
    ]);
    const { container } = render(
      <svg>{shape({ x: 10, y: 50, width: 60, index: 0 })}</svg>,
    );
    expect(container.querySelector('path[stroke="#EF4444"]')).not.toBeNull();
  });

  test("支出が予算以下の場合は緑色のラインを返す", () => {
    const shape = buildBudgetLineShape([
      { name: "食費", value: 10000, budget: 15000 },
    ]);
    const { container } = render(
      <svg>{shape({ x: 10, y: 50, width: 60, index: 0 })}</svg>,
    );
    expect(container.querySelector('path[stroke="#10B981"]')).not.toBeNull();
  });

  test("x/y/width/indexのいずれかがundefinedの場合はnullを返す", () => {
    const shape = buildBudgetLineShape([
      { name: "食費", value: 10000, budget: 15000 },
    ]);
    const { container } = render(
      <svg>{shape({ x: undefined, y: 50, width: 60, index: 0 })}</svg>,
    );
    expect(container.querySelector("path")).toBeNull();
  });
});
