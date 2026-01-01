/**
 * データ操作に関するエラーの基底クラス
 */
export class DataError extends Error {
  constructor(message: string, options?: { cause: unknown }) {
    super(message, options);
    this.cause = options?.cause;
  }
}
