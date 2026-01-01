import { db } from "../db";

type TableName = "tags" | "tagRules";

type FilterOptions = {
  where: "tagId";
  equals: string;
};

/**
 * 指定したテーブルの次のorder値を取得する
 * @param tableName テーブル名
 * @param filter オプションのフィルタ条件（tagRules用）
 * @returns 次のorder値
 */
export async function getNextOrder(
  tableName: TableName,
  filter?: FilterOptions,
): Promise<number> {
  if (tableName === "tags") {
    const maxItem = await db.tags.orderBy("order").last();
    return maxItem ? maxItem.order + 1 : 0;
  }

  if (tableName === "tagRules" && filter) {
    const rules = await db.tagRules
      .where(filter.where)
      .equals(filter.equals)
      .sortBy("order");
    const maxItem = rules[rules.length - 1];
    return maxItem ? maxItem.order + 1 : 0;
  }

  return 0;
}
