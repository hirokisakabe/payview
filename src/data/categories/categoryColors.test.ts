import { describe, it, expect } from "vitest";
import {
  DEFAULT_CATEGORY_COLORS,
  getDefaultColor,
  resolveCategoryColor,
} from "./categoryColors";

describe("getDefaultColor", () => {
  it("index に対応する色を返す", () => {
    expect(getDefaultColor(0)).toBe(DEFAULT_CATEGORY_COLORS[0]);
    expect(getDefaultColor(1)).toBe(DEFAULT_CATEGORY_COLORS[1]);
  });

  it("index が配列長を超えた場合は循環する", () => {
    const len = DEFAULT_CATEGORY_COLORS.length;
    expect(getDefaultColor(len)).toBe(DEFAULT_CATEGORY_COLORS[0]);
    expect(getDefaultColor(len + 1)).toBe(DEFAULT_CATEGORY_COLORS[1]);
  });
});

describe("resolveCategoryColor", () => {
  it("color が指定されている場合はそれを返す", () => {
    expect(resolveCategoryColor("#FF0000", 0)).toBe("#FF0000");
    expect(resolveCategoryColor("#FF0000", 5)).toBe("#FF0000");
  });

  it("color が undefined の場合は index に対応するデフォルト色を返す", () => {
    expect(resolveCategoryColor(undefined, 0)).toBe(DEFAULT_CATEGORY_COLORS[0]);
    expect(resolveCategoryColor(undefined, 1)).toBe(DEFAULT_CATEGORY_COLORS[1]);
  });

  it("color が undefined かつ同じ index なら同じ色を返す（テーブルとグラフで一致）", () => {
    const color1 = resolveCategoryColor(undefined, 3);
    const color2 = resolveCategoryColor(undefined, 3);
    expect(color1).toBe(color2);
  });
});
