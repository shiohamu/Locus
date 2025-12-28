/**
 * 同期関連API
 */

import type { SyncPullResponse } from "$lib/types";
import { apiRequest } from "./base.js";

/**
 * 同期プル
 */
export async function syncPull(since: number): Promise<SyncPullResponse> {
  return apiRequest<SyncPullResponse>(`/sync/pull?since=${since}`);
}

/**
 * 同期プッシュ
 */
export async function syncPush(data: {
  notes?: unknown[];
  tags?: unknown[];
  links?: unknown[];
}): Promise<{ message: string }> {
  return apiRequest<{ message: string }>("/sync/push", {
    method: "POST",
    body: JSON.stringify(data),
  });
}
