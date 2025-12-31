import { ResultAsync } from "neverthrow";
import { db } from "../db";

type Input = { tagIds: string[] };
type Output = undefined;

export function reorderTags(
  input: Input,
): ResultAsync<Output, ReorderTagsError> {
  return ResultAsync.fromPromise(
    (async () => {
      await db.transaction("rw", db.tags, async () => {
        for (let i = 0; i < input.tagIds.length; i++) {
          await db.tags.update(input.tagIds[i], { order: i });
        }
      });
      return undefined;
    })(),
    (err) =>
      new ReorderTagsError("タグの並び替えに失敗しました。", { cause: err }),
  );
}

export class ReorderTagsError extends Error {
  override readonly name = "ReorderTagsError" as const;
  constructor(message: string, options?: { cause: unknown }) {
    super(message, options);
    this.cause = options?.cause;
  }
}
