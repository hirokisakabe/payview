import { beforeEach, describe, expect, test, vi } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SettingsPage } from "./SettingsPage";
import { clearDatabase, renderWithRouter } from "../../test/utils";
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

describe("SettingsPage", () => {
  describe("カテゴリ追加", () => {
    test("正常系: カテゴリを追加すると一覧に表示される", async () => {
      const user = userEvent.setup();
      renderWithRouter({
        component: <SettingsPage />,
        initialPath: "/settings",
      });

      // Wait for initial render
      await waitFor(() => {
        expect(
          screen.getByPlaceholderText("新しいカテゴリ名"),
        ).toBeInTheDocument();
      });

      const input = screen.getByPlaceholderText("新しいカテゴリ名");
      await user.type(input, "食費");

      const addButton = screen.getByRole("button", { name: "追加" });
      await user.click(addButton);

      await waitFor(() => {
        expect(screen.getByText("食費")).toBeInTheDocument();
      });

      // Verify DB
      const categories = await db.categories.toArray();
      expect(categories).toHaveLength(1);
      expect(categories[0].name).toBe("食費");
    });

    test("正常系: Enterキーでカテゴリを追加できる", async () => {
      const user = userEvent.setup();
      renderWithRouter({
        component: <SettingsPage />,
        initialPath: "/settings",
      });

      // Wait for initial render
      await waitFor(() => {
        expect(
          screen.getByPlaceholderText("新しいカテゴリ名"),
        ).toBeInTheDocument();
      });

      const input = screen.getByPlaceholderText("新しいカテゴリ名");
      await user.type(input, "交通費{enter}");

      await waitFor(() => {
        expect(screen.getByText("交通費")).toBeInTheDocument();
      });
    });
  });

  describe("カテゴリ編集", () => {
    test("正常系: カテゴリ名を編集できる", async () => {
      const user = userEvent.setup();

      // Pre-populate
      await db.categories.add({ id: "cat1", name: "食費", order: 0 });

      renderWithRouter({
        component: <SettingsPage />,
        initialPath: "/settings",
      });

      await waitFor(() => {
        expect(screen.getByText("食費")).toBeInTheDocument();
      });

      // Click edit button
      const editButton = screen.getByRole("button", { name: "編集" });
      await user.click(editButton);

      // Change name
      const input = screen.getByDisplayValue("食費");
      await user.clear(input);
      await user.type(input, "食料品");

      // Save
      const saveButton = screen.getByRole("button", { name: "保存" });
      await user.click(saveButton);

      await waitFor(() => {
        expect(screen.getByText("食料品")).toBeInTheDocument();
        expect(screen.queryByText("食費")).not.toBeInTheDocument();
      });
    });
  });

  describe("カテゴリ削除", () => {
    test("正常系: カテゴリを削除できる", async () => {
      const user = userEvent.setup();

      await db.categories.add({ id: "cat1", name: "削除用", order: 0 });

      mockConfirm.mockReturnValue(true);

      renderWithRouter({
        component: <SettingsPage />,
        initialPath: "/settings",
      });

      await waitFor(() => {
        expect(screen.getByText("削除用")).toBeInTheDocument();
      });

      const deleteButton = screen.getByRole("button", { name: "削除" });
      await user.click(deleteButton);

      expect(mockConfirm).toHaveBeenCalled();

      await waitFor(() => {
        expect(screen.queryByText("削除用")).not.toBeInTheDocument();
      });
    });

    test("正常系: 削除キャンセルで削除されない", async () => {
      const user = userEvent.setup();

      await db.categories.add({ id: "cat1", name: "キャンセル用", order: 0 });

      mockConfirm.mockReturnValue(false);

      renderWithRouter({
        component: <SettingsPage />,
        initialPath: "/settings",
      });

      await waitFor(() => {
        expect(screen.getByText("キャンセル用")).toBeInTheDocument();
      });

      const deleteButton = screen.getByRole("button", { name: "削除" });
      await user.click(deleteButton);

      expect(mockConfirm).toHaveBeenCalled();

      // Still visible
      expect(screen.getByText("キャンセル用")).toBeInTheDocument();
    });
  });

  describe("ルール追加", () => {
    test("正常系: カテゴリにルールを追加できる", async () => {
      const user = userEvent.setup();

      await db.categories.add({ id: "cat1", name: "食費", order: 0 });

      renderWithRouter({
        component: <SettingsPage />,
        initialPath: "/settings",
      });

      await waitFor(() => {
        expect(screen.getByText("食費")).toBeInTheDocument();
      });

      // Find the category item and click on it to expand
      // The chevron button is the second button in the list item (after drag handle)
      const categoryItem = screen.getByText("食費").closest("li");
      const buttons = categoryItem?.querySelectorAll("button");
      const expandButton = buttons?.[1]; // Second button is the chevron
      await user.click(expandButton!);

      await waitFor(() => {
        expect(
          screen.getByPlaceholderText("マッチさせる文言を入力"),
        ).toBeInTheDocument();
      });

      // Add rule
      const ruleInput = screen.getByPlaceholderText("マッチさせる文言を入力");
      await user.type(ruleInput, "スーパー");

      const addRuleButton = screen.getByRole("button", {
        name: "ルールを追加",
      });
      await user.click(addRuleButton);

      await waitFor(() => {
        expect(screen.getByText("スーパー")).toBeInTheDocument();
      });

      // Verify DB
      const rules = await db.categoryRules.toArray();
      expect(rules).toHaveLength(1);
      expect(rules[0].pattern).toBe("スーパー");
    });
  });

  describe("空状態", () => {
    test("カテゴリがない場合は空メッセージが表示される", async () => {
      renderWithRouter({
        component: <SettingsPage />,
        initialPath: "/settings",
      });

      await waitFor(() => {
        expect(
          screen.getByText("カテゴリがまだありません"),
        ).toBeInTheDocument();
      });
    });
  });
});
