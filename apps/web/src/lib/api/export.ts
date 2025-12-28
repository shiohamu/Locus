/**
 * エクスポート関連API
 */

import { getApiBaseUrl } from "./base.js";

/**
 * Markdownエクスポート
 */
export function getMarkdownExportUrl(type?: string, tags?: string[]): string {
  const params = new URLSearchParams();
  if (type) params.set("type", type);
  if (tags && tags.length > 0) params.set("tags", tags.join(","));
  const query = params.toString();
  return `${getApiBaseUrl()}/export/markdown${query ? `?${query}` : ""}`;
}

/**
 * JSONエクスポート
 */
export function getJSONExportUrl(): string {
  return `${getApiBaseUrl()}/export/json`;
}
