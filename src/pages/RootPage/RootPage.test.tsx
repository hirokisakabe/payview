import { beforeEach, describe, expect, test, vi } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { RootPage } from "./RootPage";
import {
  clearDatabase,
  createTestCsvFile,
  createEmptyCsvFile,
  renderWithRouter,
} from "../../test/utils";
import { db } from "../../data/db";

// Mock alert and confirm
const mockAlert = vi.fn();
const mockConfirm = vi.fn();
window.alert = mockAlert;
window.confirm = mockConfirm;

beforeEach(async () => {
  vi.clearAllMocks();
  await clearDatabase();
});

/**
 * Helper to get file input element (waits for it to appear)
 */
async function getFileInput(): Promise<HTMLInputElement> {
  await waitFor(() => {
    expect(document.querySelector('input[type="file"]')).toBeInTheDocument();
  });
  return document.querySelector('input[type="file"]') as HTMLInputElement;
}

describe("RootPage", () => {
  describe("CSV登録", () => {
    test("正常系: CSVファイルを登録するとファイル一覧に表示される", async () => {
      const user = userEvent.setup();
      renderWithRouter({ component: <RootPage /> });

      const file = createTestCsvFile("test.csv", [
        { date: "2024/01/01", name: "食費", price: 1000 },
        { date: "2024/01/02", name: "交通費", price: 500 },
      ]);

      const fileInput = await getFileInput();
      await user.upload(fileInput, file);

      const submitButton = screen.getByRole("button", { name: "登録" });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText("test.csv")).toBeInTheDocument();
      });

      // Verify data is in the database
      const storedFile = await db.paymentFiles.get("test.csv");
      expect(storedFile).toBeDefined();
      expect(storedFile?.payments).toHaveLength(2);
    });

    test("正常系: 複数ファイルを登録するとすべてファイル一覧に表示される", async () => {
      const user = userEvent.setup();
      renderWithRouter({ component: <RootPage /> });

      const file1 = createTestCsvFile("file1.csv", [
        { date: "2024/01/01", name: "食費", price: 1000 },
      ]);
      const file2 = createTestCsvFile("file2.csv", [
        { date: "2024/02/01", name: "交通費", price: 500 },
      ]);

      const fileInput = await getFileInput();
      await user.upload(fileInput, [file1, file2]);

      const submitButton = screen.getByRole("button", { name: "登録" });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText("file1.csv")).toBeInTheDocument();
        expect(screen.getByText("file2.csv")).toBeInTheDocument();
      });
    });

    test("正常系: ファイルを削除するとファイル一覧から消える", async () => {
      const user = userEvent.setup();

      // Pre-populate database
      await db.paymentFiles.add({
        fileName: "delete-me.csv",
        payments: [
          { date: "2024/01/01", name: "テスト", price: 1000, count: 1 },
        ],
      });

      mockConfirm.mockReturnValue(true);
      renderWithRouter({ component: <RootPage /> });

      await waitFor(() => {
        expect(screen.getByText("delete-me.csv")).toBeInTheDocument();
      });

      // Find and click delete button (button with svg icon inside the list item)
      const listItem = screen.getByText("delete-me.csv").closest("li");
      const deleteButton = listItem?.querySelector(
        "button",
      ) as HTMLButtonElement;
      await user.click(deleteButton);

      expect(mockConfirm).toHaveBeenCalled();

      await waitFor(() => {
        expect(screen.queryByText("delete-me.csv")).not.toBeInTheDocument();
      });
    });
  });

  describe("エラーハンドリング", () => {
    test("異常系: 空のCSVファイルをアップロードするとAddPaymentsInvalidFileErrorが表示される", async () => {
      const user = userEvent.setup();
      renderWithRouter({ component: <RootPage /> });

      const emptyFile = createEmptyCsvFile("empty.csv");

      const fileInput = await getFileInput();
      await user.upload(fileInput, emptyFile);

      const submitButton = screen.getByRole("button", { name: "登録" });
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockAlert).toHaveBeenCalledWith(
          expect.stringContaining("ファイルの形式が不正です"),
        );
      });
    });

    test("異常系: 同じファイル名で2回アップロードするとAddPaymentsConstraintErrorが表示される", async () => {
      const user = userEvent.setup();
      renderWithRouter({ component: <RootPage /> });

      const file1 = createTestCsvFile("duplicate.csv", [
        { date: "2024/01/01", name: "食費", price: 1000 },
      ]);

      // First upload
      const fileInput = await getFileInput();
      await user.upload(fileInput, file1);

      const submitButton = screen.getByRole("button", { name: "登録" });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText("duplicate.csv")).toBeInTheDocument();
      });

      // Second upload with same file name
      const file2 = createTestCsvFile("duplicate.csv", [
        { date: "2024/02/01", name: "交通費", price: 500 },
      ]);

      await user.upload(fileInput, file2);
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockAlert).toHaveBeenCalledWith(
          "ファイルは既に登録されています。別のファイルを選択してください。",
        );
      });
    });
  });

  describe("空状態", () => {
    test("ファイルがない場合は空メッセージが表示される", async () => {
      renderWithRouter({ component: <RootPage /> });

      await waitFor(() => {
        expect(
          screen.getByText("登録されているファイルがありません"),
        ).toBeInTheDocument();
      });
    });
  });
});
