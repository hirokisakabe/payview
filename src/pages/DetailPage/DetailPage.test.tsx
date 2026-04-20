import { beforeEach, describe, expect, test, vi } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import { DetailPage } from "./DetailPage";
import { clearDatabase, renderWithRouter } from "../../test/utils";
import { db } from "../../data/db";

beforeEach(async () => {
  vi.clearAllMocks();
  await clearDatabase();
});

describe("DetailPage", () => {
  describe("支払い一覧表示", () => {
    test("正常系: DBにデータがあれば支払い一覧が表示される", async () => {
      // Pre-populate database
      await db.paymentFiles.add({
        fileName: "test.csv",
        payments: [
          { date: "2024/01/01", name: "食費", price: 1000, count: 1 },
          { date: "2024/01/02", name: "交通費", price: 500, count: 1 },
        ],
      });

      renderWithRouter({
        component: <DetailPage fileName="test.csv" activeTab="payments" />,
        initialPath: "/payments/test.csv?tab=payments",
      });

      await waitFor(() => {
        expect(screen.getByText("食費")).toBeInTheDocument();
        expect(screen.getByText("交通費")).toBeInTheDocument();
      });
    });

    test("正常系: 合計金額が表示される", async () => {
      await db.paymentFiles.add({
        fileName: "test.csv",
        payments: [
          { date: "2024/01/01", name: "食費", price: 1000, count: 1 },
          { date: "2024/01/02", name: "交通費", price: 500, count: 1 },
        ],
      });

      renderWithRouter({
        component: <DetailPage fileName="test.csv" activeTab="payments" />,
        initialPath: "/payments/test.csv?tab=payments",
      });

      await waitFor(() => {
        // Total should be 1500円
        expect(screen.getByText(/1,500/)).toBeInTheDocument();
      });
    });
  });

  describe("タブ切り替え", () => {
    test("タブが正しく表示される", async () => {
      await db.paymentFiles.add({
        fileName: "test.csv",
        payments: [{ date: "2024/01/01", name: "食費", price: 1000, count: 1 }],
      });

      renderWithRouter({
        component: <DetailPage fileName="test.csv" activeTab="breakdown" />,
        initialPath: "/payments/test.csv?tab=breakdown",
      });

      await waitFor(() => {
        expect(screen.getByRole("tab", { name: "内訳" })).toBeInTheDocument();
        expect(
          screen.getByRole("tab", { name: "支払い一覧" }),
        ).toBeInTheDocument();
      });
    });
  });

  describe("カテゴリ別表示", () => {
    test("正常系: カテゴリ設定あり - グループ化表示", async () => {
      // Add payment file
      await db.paymentFiles.add({
        fileName: "test.csv",
        payments: [
          { date: "2024/01/01", name: "スーパー", price: 1000, count: 1 },
          { date: "2024/01/02", name: "コンビニ", price: 500, count: 1 },
        ],
      });

      // Add category and rule
      await db.categories.add({ id: "cat1", name: "食費", order: 0 });
      await db.categoryRules.add({
        id: "rule1",
        categoryId: "cat1",
        pattern: "スーパー",
        order: 0,
      });

      renderWithRouter({
        component: <DetailPage fileName="test.csv" activeTab="breakdown" />,
        initialPath: "/payments/test.csv?tab=breakdown",
      });

      await waitFor(() => {
        // Category name should appear
        expect(screen.getByText("食費")).toBeInTheDocument();
      });
    });

    test("正常系: カテゴリ未設定時 - 未カテゴリとして表示される", async () => {
      await db.paymentFiles.add({
        fileName: "test.csv",
        payments: [
          { date: "2024/01/01", name: "スーパーA", price: 1000, count: 1 },
        ],
      });

      // No categories added

      renderWithRouter({
        component: <DetailPage fileName="test.csv" activeTab="breakdown" />,
        initialPath: "/payments/test.csv?tab=breakdown",
      });

      await waitFor(() => {
        // Uncategorized payments are grouped under "未分類"
        expect(screen.getByText("未分類")).toBeInTheDocument();
      });
    });
  });
});
