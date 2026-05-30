import { beforeEach, expect, test, vi } from "vitest";
import {
  addPayments,
  upsertPayments,
  AddPaymentsConstraintError,
  AddPaymentsInvalidFileError,
} from "./addPayments";
import {
  convertFileToCsvData,
  ConvertFileToCsvInvalidCsvError,
} from "./convertFileToCsvData";
import {
  createPayments,
  upsertPayments as upsertPaymentsCore,
  CreatePaymentsConstraintError,
} from "./createPayments";
import { convertCsvDataToPaymentData } from "./convertCsvDataToPaymentData";

// createPayments と upsertPayments のみをモックし、クラスは実実装を使う
vi.mock("./createPayments", async (importOriginal) => {
  const actual = await importOriginal<typeof import("./createPayments")>();
  return {
    ...actual,
    createPayments: vi.fn(),
    upsertPayments: vi.fn(),
  };
});
vi.mock("./convertFileToCsvData");
vi.mock("./convertCsvDataToPaymentData");

const dummyFiles = [
  new File(["dummy_data"], "test1.csv"),
  new File(["dummy_data"], "test2.csv"),
];

beforeEach(() => {
  vi.clearAllMocks();

  vi.mocked(convertFileToCsvData).mockResolvedValue({
    csvData: [
      {
        date: "2023-01-01",
        name: "Test",
        price: 100,
        count: 1,
      },
    ],
  });

  vi.mocked(convertCsvDataToPaymentData).mockReturnValue({
    payments: [
      {
        date: "2023-01-01",
        name: "Test",
        price: 100,
        count: 1,
      },
    ],
  });

  vi.mocked(createPayments).mockResolvedValue(undefined);
  vi.mocked(upsertPaymentsCore).mockResolvedValue(undefined);
});

test("正常系: データ登録", async () => {
  await expect(addPayments(dummyFiles)).resolves.toBeUndefined();
});

test("異常系: ファイルのデータ変換でエラーになった場合", async () => {
  vi.mocked(convertFileToCsvData).mockRejectedValue(new Error("dummy_message"));

  await expect(addPayments(dummyFiles)).rejects.toThrow(
    "不明なエラーが発生しました。",
  );
});

test("異常系: CSVデータとして読み込めなかった場合", async () => {
  vi.mocked(convertFileToCsvData).mockRejectedValue(
    new ConvertFileToCsvInvalidCsvError("dummy_message"),
  );

  await expect(addPayments(dummyFiles)).rejects.toThrow(
    AddPaymentsInvalidFileError,
  );
});

test("異常系: データのパースでエラーになった場合", async () => {
  vi.mocked(convertCsvDataToPaymentData).mockImplementation(() => {
    throw new Error("dummy_message");
  });

  await expect(addPayments(dummyFiles)).rejects.toThrow(
    AddPaymentsInvalidFileError,
  );
});

test("異常系: IndexedDBへの登録でエラーが発生した場合(重複)", async () => {
  vi.mocked(createPayments).mockRejectedValue(
    new CreatePaymentsConstraintError("dummy_message"),
  );

  await expect(addPayments(dummyFiles)).rejects.toThrow(
    AddPaymentsConstraintError,
  );
});

test("異常系: IndexedDBへの登録でエラーが発生した場合(重複)、conflictingFileNamesが伝播する", async () => {
  vi.mocked(createPayments).mockRejectedValue(
    new CreatePaymentsConstraintError("dummy_message", {
      cause: undefined,
      conflictingFileNames: ["test1.csv"],
    }),
  );

  const result = addPayments(dummyFiles);
  await expect(result).rejects.toMatchObject({
    conflictingFileNames: ["test1.csv"],
  });
});

test("異常系: IndexedDBへの登録でエラーが発生した場合", async () => {
  vi.mocked(createPayments).mockRejectedValue(new Error("dummy_message"));

  await expect(addPayments(dummyFiles)).rejects.toThrow(
    "不明なエラーが発生しました。",
  );
});

test("upsertPayments: 正常系", async () => {
  await expect(upsertPayments(dummyFiles)).resolves.toBeUndefined();
  expect(upsertPaymentsCore).toHaveBeenCalled();
});
