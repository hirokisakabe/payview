import { beforeEach, expect, test, vi } from "vitest";
import {
  convertFileToCsvData,
  ConvertFileToCsvInvalidCsvError,
  ConvertFileToCsvUnknownError,
} from "./convertFileToCsvData";

vi.mock("csv-parse/browser/esm/sync", () => ({
  parse: vi.fn(),
}));

vi.mock("encoding-japanese", () => ({
  default: {
    convert: vi.fn(),
  },
}));

import { parse } from "csv-parse/browser/esm/sync";
import Encoding from "encoding-japanese";

beforeEach(() => {
  vi.clearAllMocks();
});

function createMockFile(content: string, name: string): File {
  const file = new File([content], name, { type: "text/csv" });
  // jsdom環境でarrayBuffer()が存在しない場合があるため、definePropertyで追加
  Object.defineProperty(file, "arrayBuffer", {
    value: () => Promise.resolve(new TextEncoder().encode(content).buffer),
    writable: true,
  });
  return file;
}

test("正常系: CSVファイルがパースされる", async () => {
  const mockCsvData = [
    {
      date: "2023-01-01",
      name: "食費",
      price: "1000",
      count: "1",
      noname1: "",
      noname2: "",
      noname3: "",
    },
  ];
  vi.mocked(Encoding.convert).mockReturnValue([]);
  vi.mocked(parse).mockReturnValue(mockCsvData as never);

  const file = createMockFile("dummy", "test.csv");
  const result = await convertFileToCsvData({ file });

  expect(result.isOk()).toBe(true);
  expect(result._unsafeUnwrap().csvData).toEqual(mockCsvData);
});

test("正常系: 複数行のCSVがパースされる", async () => {
  const mockCsvData = [
    { date: "2023-01-01", name: "食費", price: "1000", count: "1" },
    { date: "2023-01-02", name: "交通費", price: "500", count: "2" },
  ];
  vi.mocked(Encoding.convert).mockReturnValue([]);
  vi.mocked(parse).mockReturnValue(mockCsvData as never);

  const file = createMockFile("dummy", "test.csv");
  const result = await convertFileToCsvData({ file });

  expect(result.isOk()).toBe(true);
  expect(result._unsafeUnwrap().csvData).toHaveLength(2);
});

test("異常系: CSVが空の場合、ConvertFileToCsvInvalidCsvErrorを返す", async () => {
  vi.mocked(Encoding.convert).mockReturnValue([]);
  vi.mocked(parse).mockReturnValue([]);

  const file = createMockFile("", "empty.csv");
  const result = await convertFileToCsvData({ file });

  expect(result.isErr()).toBe(true);
  expect(result._unsafeUnwrapErr()).toBeInstanceOf(
    ConvertFileToCsvInvalidCsvError,
  );
  expect(result._unsafeUnwrapErr().message).toBe(
    "ファイルのデータを読み取れませんでした。",
  );
});

test("異常系: パース中にエラーが発生した場合、ConvertFileToCsvUnknownErrorを返す", async () => {
  vi.mocked(Encoding.convert).mockReturnValue([]);
  vi.mocked(parse).mockImplementation(() => {
    throw new Error("Parse error");
  });

  const file = createMockFile("invalid", "test.csv");
  const result = await convertFileToCsvData({ file });

  expect(result.isErr()).toBe(true);
  expect(result._unsafeUnwrapErr()).toBeInstanceOf(
    ConvertFileToCsvUnknownError,
  );
});
