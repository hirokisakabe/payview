import { ResultAsync } from "neverthrow";
import { db } from "../db";

type Input = { name: string };
type Output = string;

export function addTag(input: Input): ResultAsync<Output, AddTagError> {
  return ResultAsync.fromPromise(
    (async () => {
      const id = crypto.randomUUID();
      const maxOrder = await db.tags.orderBy("order").last();
      const order = maxOrder ? maxOrder.order + 1 : 0;

      await db.tags.add({
        id,
        name: input.name,
        order,
      });

      return id;
    })(),
    (err) => new AddTagError("タグの追加に失敗しました。", { cause: err }),
  );
}

export class AddTagError extends Error {
  override readonly name = "AddTagError" as const;
  constructor(message: string, options?: { cause: unknown }) {
    super(message, options);
    this.cause = options?.cause;
  }
}
