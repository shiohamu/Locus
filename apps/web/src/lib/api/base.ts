/**
 * API共通処理
 */

import type { APIError } from "@locus/shared";
import { apiCache } from "./cache.js";

/**
 * APIベースURLを取得
 * @returns APIベースURL
 */
export function getApiBaseUrl(): string {
  return import.meta.env.VITE_API_URL || (import.meta.env.DEV ? "/api" : "http://localhost:3000");
}

/**
 * APIリクエストの共通処理
 * @param endpoint APIエンドポイント
 * @param options リクエストオプション
 * @param options.useCache キャッシュを使用するか（デフォルト: false）
 * @param options.cacheTTL キャッシュの有効期限（ミリ秒、デフォルト: 5分）
 * @returns レスポンスデータ
 * @throws {Error} APIエラーが発生した場合
 */
export async function apiRequest<T>(
  endpoint: string,
  options?: RequestInit & {
    useCache?: boolean;
    cacheTTL?: number;
  }
): Promise<T> {
  const { useCache = false, cacheTTL, ...fetchOptions } = options || {};

  // GETリクエストでキャッシュが有効な場合、キャッシュをチェック
  if (useCache && (!fetchOptions.method || fetchOptions.method === "GET")) {
    const cacheKey = `${endpoint}${fetchOptions.body ? `:${fetchOptions.body}` : ""}`;
    const cached = apiCache.get<T>(cacheKey);
    if (cached !== null) {
      return cached;
    }
  }

  const url = `${getApiBaseUrl()}${endpoint}`;
  const response = await fetch(url, {
    ...fetchOptions,
    headers: {
      "Content-Type": "application/json",
      ...fetchOptions.headers,
    },
  });

  if (!response.ok) {
    let errorData: APIError;
    try {
      errorData = (await response.json()) as APIError;
    } catch {
      errorData = {
        error: "Unknown error",
      };
    }
    throw new Error(errorData.error || `HTTP ${response.status}`);
  }

  const data = (await response.json()) as T;

  // GETリクエストでキャッシュが有効な場合、キャッシュに保存
  if (useCache && (!fetchOptions.method || fetchOptions.method === "GET")) {
    const cacheKey = `${endpoint}${fetchOptions.body ? `:${fetchOptions.body}` : ""}`;
    apiCache.set(cacheKey, data, cacheTTL);
  }

  return data;
}
