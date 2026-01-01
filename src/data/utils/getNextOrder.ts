import { db } from "../db";

type TableName = "categories" | "categoryRules";

type FilterOptions = {
  where: "categoryId";
  equals: string;
};

/**
 * 指定したテーブルの次のorder値を取得する
 * @param tableName テーブル名
 * @param filter オプションのフィルタ条件（categoryRules用）
 * @returns 次のorder値
 */
export async function getNextOrder(
  tableName: TableName,
  filter?: FilterOptions,
): Promise<number> {
  if (tableName === "categories") {
    const maxItem = await db.categories.orderBy("order").last();
    return maxItem ? maxItem.order + 1 : 0;
  }

  if (tableName === "categoryRules" && filter) {
    const rules = await db.categoryRules
      .where(filter.where)
      .equals(filter.equals)
      .sortBy("order");
    const maxItem = rules[rules.length - 1];
    return maxItem ? maxItem.order + 1 : 0;
  }

  return 0;
}
