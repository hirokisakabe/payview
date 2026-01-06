import { expect, test } from "vitest";
import { convertCsvDataToPaymentData } from "./convertCsvDataToPaymentData";

test("正常系: 有効なCSVデータがPayment[]に変換される", () => {
  const csvData = [
    { date: "2023-01-01", name: "食費", price: "1000", count: "1" },
    { date: "2023-01-02", name: "交通費", price: "500", count: "2" },
  ];

  const result = convertCsvDataToPaymentData({ csvData });

  expect(result.payments).toEqual([
    { date: "2023-01-01", name: "食費", price: 1000, count: 1 },
    { date: "2023-01-02", name: "交通費", price: 500, count: 2 },
  ]);
});

test("正常系: price/countが文字列から数値に変換される", () => {
  const csvData = [
    { date: "2023-01-01", name: "テスト", price: "12345", count: "99" },
  ];

  const result = convertCsvDataToPaymentData({ csvData });

  const payment = result.payments[0];
  expect(typeof payment.price).toBe("number");
  expect(typeof payment.count).toBe("number");
  expect(payment.price).toBe(12345);
  expect(payment.count).toBe(99);
});

test("正常系: 空配列の場合、空のPayment[]を返す", () => {
  const csvData: unknown[] = [];

  const result = convertCsvDataToPaymentData({ csvData });

  expect(result.payments).toEqual([]);
});

test("異常系: 必須フィールドがない場合、InvalidSchemaErrorをthrowする", () => {
  const csvData = [
    { date: "2023-01-01", name: "食費" }, // price, count がない
  ];

  expect(() => convertCsvDataToPaymentData({ csvData })).toThrow(
    "ファイルの形式が不正です。",
  );
});

test("正常系: priceが数値に変換できない場合、NaNが返される", () => {
  // parseInt("invalid") は NaN を返すが、Zodはエラーとして扱わない
  const csvData = [
    { date: "2023-01-01", name: "食費", price: "invalid", count: "1" },
  ];

  const result = convertCsvDataToPaymentData({ csvData });

  const payment = result.payments[0];
  expect(payment.price).toBeNaN();
});
