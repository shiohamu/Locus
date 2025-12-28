/**
 * APIリクエストキャッシュ
 */

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiresAt: number;
}

/**
 * シンプルなメモリキャッシュ
 */
class APICache {
  private cache = new Map<string, CacheEntry<unknown>>();
  private readonly defaultTTL = 5 * 60 * 1000; // 5分

  /**
   * キャッシュからデータを取得
   * @param key キャッシュキー
   * @returns キャッシュされたデータ、またはnull
   */
  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) {
      return null;
    }

    // 有効期限をチェック
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return null;
    }

    return entry.data as T;
  }

  /**
   * キャッシュにデータを保存
   * @param key キャッシュキー
   * @param data キャッシュするデータ
   * @param ttl 有効期限（ミリ秒）
   */
  set<T>(key: string, data: T, ttl = this.defaultTTL): void {
    const now = Date.now();
    this.cache.set(key, {
      data,
      timestamp: now,
      expiresAt: now + ttl,
    });
  }

  /**
   * キャッシュからデータを削除
   * @param key キャッシュキー
   */
  delete(key: string): void {
    this.cache.delete(key);
  }

  /**
   * パターンに一致するすべてのキャッシュを削除
   * @param pattern 削除するキーのパターン（例: "/notes"）
   */
  deletePattern(pattern: string): void {
    for (const key of this.cache.keys()) {
      if (key.includes(pattern)) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * すべてのキャッシュをクリア
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * 期限切れのキャッシュを削除
   */
  cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expiresAt) {
        this.cache.delete(key);
      }
    }
  }
}

// シングルトンインスタンス
export const apiCache = new APICache();

// 定期的にクリーンアップ（5分ごと）
if (typeof window !== "undefined") {
  setInterval(() => {
    apiCache.cleanup();
  }, 5 * 60 * 1000);
}

