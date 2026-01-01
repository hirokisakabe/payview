/**
 * フックの戻り値型
 * ローディング中か完了かを型で区別
 */
export type QueryResult<T> =
  | { status: "loading" }
  | { status: "completed"; data: T };
