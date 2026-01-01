import { ResultAsync } from "neverthrow";
import { db } from "../db";
import { getNextOrder } from "../utils/getNextOrder";

type Input = { name: string };
type Output = string;

export function addCategory(
  input: Input,
): ResultAsync<Output, AddCategoryError> {
  return ResultAsync.fromPromise(
    (async () => {
      const id = crypto.randomUUID();
      const order = await getNextOrder("categories");

      await db.categories.add({
        id,
        name: input.name,
        order,
      });

      return id;
    })(),
    (err) =>
      new AddCategoryError("カテゴリの追加に失敗しました。", { cause: err }),
  );
}

export class AddCategoryError extends Error {
  override readonly name = "AddCategoryError" as const;
  constructor(message: string, options?: { cause: unknown }) {
    super(message, options);
    this.cause = options?.cause;
  }
}
