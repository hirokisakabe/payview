import { expect, test } from "vitest";
import { formatYen } from "./formatYen";

test("正の整数を正しくフォーマットする", () => {
  expect(formatYen(123456)).toBe("123,456 円");
});

test("0を正しくフォーマットする", () => {
  expect(formatYen(0)).toBe("0 円");
});

test("小さい数値を正しくフォーマットする", () => {
  expect(formatYen(100)).toBe("100 円");
});

test("大きい数値を正しくフォーマットする", () => {
  expect(formatYen(1234567890)).toBe("1,234,567,890 円");
});

test("負の数値を正しくフォーマットする", () => {
  expect(formatYen(-5000)).toBe("-5,000 円");
});
