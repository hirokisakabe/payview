import { beforeEach, expect, test, vi } from "vitest";
import {
  addPayments,
  AddPaymentsConstraintError,
  AddPaymentsUnknownError,
} from "./addPayments";
import { err, ok, ResultAsync } from "neverthrow";
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

  vi.mocked(convertFileToCsvData).mockReturnValue(
    ResultAsync.fromSafePromise(
      Promise.resolve({
        csvData: [
          {
            date: "2023-01-01",
            name: "Test",
            price: 100,
            count: 1,
          },
        ],
      }),
    ),
  );

  vi.mocked(convertCsvDataToPaymentData).mockReturnValue(
    ok({
      payments: [
        {
          date: "2023-01-01",
          name: "Test",
          price: 100,
          count: 1,
        },
      ],
    }),
  );

  vi.mocked(createPayments).mockReturnValue(
    ResultAsync.fromSafePromise(Promise.resolve(undefined)),
  );
});

test("正常系: データ登録", async () => {
  const result = await addPayments(dummyFiles);

  expect(result.isOk()).toBe(true);
});

test("異常系: ファイルのデータ変換でエラーになった場合", async () => {
  vi.mocked(convertFileToCsvData).mockReturnValue(
    ResultAsync.fromPromise(
      Promise.reject(new ConvertFileToCsvUnknownError("dummy_message")),
      (error) =>
        new ConvertFileToCsvUnknownError("dummy_message", {
          cause: error,
        }),
    ),
  );

  const result = await addPayments(dummyFiles);

  expect(result.isErr()).toBe(true);
  expect(result._unsafeUnwrapErr().name).toBe("AddPaymentsUnknownError");
});

test("異常系: CSVデータとして読み込めなかった場合", async () => {
  vi.mocked(convertFileToCsvData).mockReturnValue(
    ResultAsync.fromPromise(
      Promise.reject(new ConvertFileToCsvInvalidCsvError("dummy_message")),
      (error) =>
        new ConvertFileToCsvInvalidCsvError("dummy_message", {
          cause: error,
        }),
    ),
  );

  const result = await addPayments(dummyFiles);

  expect(result.isErr()).toBe(true);
  expect(result._unsafeUnwrapErr().name).toBe("AddPaymentsInvalidFileError");
});

test("異常系: データのパースでエラーになった場合", async () => {
  vi.mocked(convertCsvDataToPaymentData).mockReturnValue(
    err(new ConvertCsvDataToPaymentDataInvalidSchemaError("dummy_message")),
  );

  const result = await addPayments(dummyFiles);

  expect(result.isErr()).toBe(true);
  expect(result._unsafeUnwrapErr().name).toBe("AddPaymentsInvalidFileError");
});

test("異常系: IndexedDBへの登録でエラーが発生した場合(重複)", async () => {
  vi.mocked(createPayments).mockResolvedValue(
    err(new CreatePaymentsConstraintError("dummy_message")),
  );

  const result = await addPayments(dummyFiles);

  expect(result.isErr()).toBe(true);
  expect(result._unsafeUnwrapErr()).instanceOf(AddPaymentsConstraintError);
});

test("異常系: IndexedDBへの登録でエラーが発生した場合", async () => {
  vi.mocked(createPayments).mockResolvedValue(
    err(new CreatePaymentsUnknownError("dummy_message")),
  );

  const result = await addPayments(dummyFiles);

  expect(result.isErr()).toBe(true);
  expect(result._unsafeUnwrapErr()).instanceOf(AddPaymentsUnknownError);
});
