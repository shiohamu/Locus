/**
 * グラフ関連API
 */

import type { GraphNode, GraphEdge } from "$lib/types";
import { apiRequest } from "./base.js";

/**
 * グラフデータ取得
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
  return apiRequest<{ nodes: GraphNode[]; edges: GraphEdge[] }>(
    `/graph${query ? `?${query}` : ""}`
  );
}
