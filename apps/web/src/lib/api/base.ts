/**
 * API共通処理
 */

/**
 * APIベースURLを取得
 */
export function getApiBaseUrl(): string {
  return import.meta.env.VITE_API_URL || (import.meta.env.DEV ? "/api" : "http://localhost:3000");
}

/**
 * APIリクエストの共通処理
 */
export async function apiRequest<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const url = `${getApiBaseUrl()}${endpoint}`;
  const response = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({
      error: "Unknown error",
    }));
    throw new Error(error.error || `HTTP ${response.status}`);
  }

  return response.json();
}
