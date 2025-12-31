import { useLiveQuery } from "dexie-react-hooks";
import { db, type TagRule } from "../db";

type Props = {
  tagId: string;
};

type UseTagRulesResult =
  | { status: "loading" }
  | { status: "completed"; rules: TagRule[] };

export function useTagRules({ tagId }: Props): UseTagRulesResult {
  const rules = useLiveQuery(
    () => db.tagRules.where("tagId").equals(tagId).sortBy("order"),
    [tagId],
  );

  if (!rules) {
    return { status: "loading" as const };
  }

  return { status: "completed" as const, rules };
}
