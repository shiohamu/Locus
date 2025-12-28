/**
 * 検索関連API
 */

import type { NoteCore } from "$lib/types";
import { apiRequest } from "./base.js";

/**
 * 全文検索
 */
export async function searchNotes(
  query: string,
  options?: {
    limit?: number;
    offset?: number;
  }
): Promise<NoteCore[]> {
  const params = new URLSearchParams({ q: query });
  if (options?.limit) params.set("limit", String(options.limit));
  if (options?.offset) params.set("offset", String(options.offset));

  return apiRequest<NoteCore[]>(`/search?${params.toString()}`);
}
