import { useLiveQuery } from "dexie-react-hooks";
import { db, type Tag } from "../db";

type UseTagsResult =
  | { status: "loading" }
  | { status: "completed"; tags: Tag[] };

export function useTags(): UseTagsResult {
  const tags = useLiveQuery(() => db.tags.orderBy("order").toArray());

  if (!tags) {
    return { status: "loading" as const };
  }

  return { status: "completed" as const, tags };
}
