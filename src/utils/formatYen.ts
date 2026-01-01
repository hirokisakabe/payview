/**
 * 金額を「123,456 円」形式にフォーマットする
 * @param amount - フォーマットする金額（数値）
 * @returns フォーマット済み文字列（例: "123,456 円"）
 */
export function formatYen(amount: number): string {
  return `${amount.toLocaleString()} 円`;
}
