import { ResultAsync } from "neverthrow";
import { db } from "../db";

type Input = { id: string };
type Output = undefined;

export function deleteTag(input: Input): ResultAsync<Output, DeleteTagError> {
  return ResultAsync.fromPromise(
    (async () => {
      await db.transaction("rw", [db.tags, db.tagRules], async () => {
        await db.tagRules.where("tagId").equals(input.id).delete();
        await db.tags.delete(input.id);
      });
      return undefined;
    })(),
    (err) => new DeleteTagError("タグの削除に失敗しました。", { cause: err }),
  );
}

export class DeleteTagError extends Error {
  override readonly name = "DeleteTagError" as const;
  constructor(message: string, options?: { cause: unknown }) {
    super(message, options);
    this.cause = options?.cause;
  }
}
