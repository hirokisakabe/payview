import { beforeEach, expect, test, vi } from "vitest";
import {
  addPayments,
  AddPaymentsConstraintError,
  AddPaymentsInvalidFileError,
  AddPaymentsUnknownError,
} from "./addPayments";
import {
  convertFileToCsvData,
  ConvertFileToCsvInvalidCsvError,
  ConvertFileToCsvUnknownError,
} from "./convertFileToCsvData";
import {
  createPayments,
  CreatePaymentsConstraintError,
  CreatePaymentsUnknownError,
} from "./createPayments";
import {
  convertCsvDataToPaymentData,
  ConvertCsvDataToPaymentDataInvalidSchemaError,
} from "./convertCsvDataToPaymentData";

vi.mock("./createPayments");
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
});

test("正常系: データ登録", async () => {
  await expect(addPayments(dummyFiles)).resolves.toBeUndefined();
});

test("異常系: ファイルのデータ変換でエラーになった場合", async () => {
  vi.mocked(convertFileToCsvData).mockRejectedValue(
    new ConvertFileToCsvUnknownError("dummy_message"),
  );

  await expect(addPayments(dummyFiles)).rejects.toThrow(
    AddPaymentsUnknownError,
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
    throw new ConvertCsvDataToPaymentDataInvalidSchemaError("dummy_message");
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

test("異常系: IndexedDBへの登録でエラーが発生した場合", async () => {
  vi.mocked(createPayments).mockRejectedValue(
    new CreatePaymentsUnknownError("dummy_message"),
  );

  await expect(addPayments(dummyFiles)).rejects.toThrow(
    AddPaymentsUnknownError,
  );
});
