import { ResultAsync } from "neverthrow";
import { db } from "../db";

type Input = { id: string; name: string };
type Output = undefined;

export function updateTag(input: Input): ResultAsync<Output, UpdateTagError> {
  return ResultAsync.fromPromise(
    (async () => {
      await db.tags.update(input.id, { name: input.name });
      return undefined;
    })(),
    (err) => new UpdateTagError("タグの更新に失敗しました。", { cause: err }),
  );
}

export class UpdateTagError extends Error {
  override readonly name = "UpdateTagError" as const;
  constructor(message: string, options?: { cause: unknown }) {
    super(message, options);
    this.cause = options?.cause;
  }
}
