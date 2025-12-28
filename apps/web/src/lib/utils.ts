/**
 * ユーティリティ関数
 */

/**
 * Unix timestamp（秒）をDateオブジェクトに変換
 * @param timestamp Unix timestamp（秒）
 * @returns Dateオブジェクト
 */
export function timestampToDate(timestamp: number): Date {
  return new Date(timestamp * 1000);
}

/**
 * DateオブジェクトをUnix timestamp（秒）に変換
 * @param date Dateオブジェクト
 * @returns Unix timestamp（秒）
 */
export function dateToTimestamp(date: Date): number {
  return Math.floor(date.getTime() / 1000);
}

/**
 * 現在のUnix timestamp（秒）を取得
 * @returns 現在のUnix timestamp（秒）
 */
export function nowTimestamp(): number {
  return Math.floor(Date.now() / 1000);
}

/**
 * UUID v4を生成
 * @returns UUID v4文字列
 */
export function generateId(): string {
  return crypto.randomUUID();
}

/**
 * 日時をフォーマット
 * @param timestamp Unix timestamp（秒）、またはnull
 * @param defaultValue nullの場合に返すデフォルト値（デフォルト: ""）
 */
export function formatDate(timestamp: number | null, defaultValue = ""): string {
  if (timestamp === null) {
    return defaultValue;
  }
  const date = timestampToDate(timestamp);
  return date.toLocaleString("ja-JP");
}
