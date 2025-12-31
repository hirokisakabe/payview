import { useLiveQuery } from "dexie-react-hooks";
import { db, type Tag, type TagRule } from "../db";

type TagWithRules = Tag & {
  rules: TagRule[];
};

type UseAllTagRulesResult =
  | { status: "loading" }
  | { status: "completed"; tagsWithRules: TagWithRules[] };

export function useAllTagRules(): UseAllTagRulesResult {
  const result = useLiveQuery(async () => {
    const tags = await db.tags.orderBy("order").toArray();
    const allRules = await db.tagRules.toArray();

    const tagsWithRules: TagWithRules[] = tags.map((tag) => ({
      ...tag,
      rules: allRules
        .filter((rule) => rule.tagId === tag.id)
        .sort((a, b) => a.order - b.order),
    }));

    return tagsWithRules;
  });

  if (!result) {
    return { status: "loading" as const };
  }

  return { status: "completed" as const, tagsWithRules: result };
}
