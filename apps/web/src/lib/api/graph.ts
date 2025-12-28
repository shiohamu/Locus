/**
 * グラフ関連API
 */

import type { GraphEdge, GraphNode } from "$lib/types";
import { apiRequest } from "./base.js";

/**
 * グラフデータ取得
 * @param options 取得オプション
 * @param options.type ノートタイプ（"md" | "rss" | "web_clip"）
 * @param options.tags タグフィルター
 * @param options.limit 取得件数
 * @returns グラフデータ（ノードとエッジ）
 * @throws {Error} APIエラーが発生した場合
 */
export async function getGraphData(options?: {
  type?: "md" | "rss" | "web_clip";
  tags?: string[];
  limit?: number;
}): Promise<{ nodes: GraphNode[]; edges: GraphEdge[] }> {
  const params = new URLSearchParams();
  if (options?.type) params.set("type", options.type);
  if (options?.tags && options.tags.length > 0) params.set("tags", options.tags.join(","));
  if (options?.limit) params.set("limit", String(options.limit));

  const query = params.toString();
  const endpoint = `/graph${query ? `?${query}` : ""}`;

  // デバッグログ
  if (import.meta.env.DEV) {
    console.log("[Graph API] Request:", endpoint, "Tags:", options?.tags);
  }

  return apiRequest<{ nodes: GraphNode[]; edges: GraphEdge[] }>(endpoint, {
    useCache: false, // タグフィルターが変更される可能性があるため、キャッシュを無効化
    cacheTTL: 1 * 60 * 1000, // 1分（グラフデータは比較的頻繁に更新される可能性がある）
  });
}
