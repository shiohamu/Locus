/**
 * 同期関連API
 */

import type { SyncPullResponse, SyncPushRequest } from "$lib/types";
import type { MessageResponse } from "$lib/types/api";
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
export async function syncPush(data: SyncPushRequest): Promise<MessageResponse> {
  return apiRequest<MessageResponse>("/sync/push", {
    method: "POST",
    body: JSON.stringify(data),
  });
}
