import { expect, test, vi, beforeEach } from "vitest";
import { sanitizeCell, downloadCsv } from "./downloadCsv";

// sanitizeCell

test("通常の文字列はダブルクォートで囲まれる", () => {
  expect(sanitizeCell("スターバックス")).toBe('"スターバックス"');
});

test('ダブルクォートを含む値は "" にエスケープされる', () => {
  expect(sanitizeCell('彼は"天才"だ')).toBe('"彼は""天才""だ"');
});

test("= で始まる値に ' を前置する（CSV Injection 対策）", () => {
  expect(sanitizeCell("=SUM(A1:A10)")).toBe('"\'=SUM(A1:A10)"');
});

test("+ で始まる値に ' を前置する", () => {
  expect(sanitizeCell("+123")).toBe(`"'+123"`);
});

test("- で始まる値に ' を前置する", () => {
  expect(sanitizeCell("-123")).toBe(`"'-123"`);
});

test("@ で始まる値に ' を前置する", () => {
  expect(sanitizeCell("@foo")).toBe('"\'@foo"');
});

test("危険文字が先頭以外にある場合はそのまま", () => {
  expect(sanitizeCell("foo=bar")).toBe('"foo=bar"');
});

// downloadCsv

beforeEach(() => {
  vi.stubGlobal("URL", {
    createObjectURL: vi.fn(() => "blob:fake"),
    revokeObjectURL: vi.fn(),
  });

  const fakeLink = {
    href: "",
    download: "",
    click: vi.fn(),
  };
  vi.spyOn(document, "createElement").mockReturnValue(
    fakeLink as unknown as HTMLElement,
  );
});

test("downloadCsv: ヘッダー行とデータ行を含むファイルをダウンロードする", () => {
  const clickSpy = vi.fn();
  const fakeLink = { href: "", download: "", click: clickSpy };
  vi.spyOn(document, "createElement").mockReturnValue(
    fakeLink as unknown as HTMLElement,
  );

  downloadCsv("test.csv", [
    ["日付", "金額", "カテゴリ", "説明"],
    ["2024-01-01", "1000", "食費", "スタバ"],
  ]);

  expect(fakeLink.download).toBe("test.csv");
  expect(clickSpy).toHaveBeenCalledOnce();
});
