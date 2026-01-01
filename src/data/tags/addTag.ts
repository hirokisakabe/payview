import { ResultAsync } from "neverthrow";
import { db } from "../db";
import { getNextOrder } from "../utils/getNextOrder";

type Input = { name: string };
type Output = string;

export function addTag(input: Input): ResultAsync<Output, AddTagError> {
  return ResultAsync.fromPromise(
    (async () => {
      const id = crypto.randomUUID();
      const order = await getNextOrder("tags");

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
