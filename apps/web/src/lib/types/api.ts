/**
 * API型定義
 */

import type { Link, NoteCore, NoteMD, RSSFeed, RSSItem, SyncPushRequest, Tag } from "$lib/types";

/**
 * ノート作成リクエスト
 */
export interface CreateNoteRequest {
  core: NoteCore;
  md?: NoteMD;
}

/**
 * ノート更新リクエスト
 */
export interface UpdateNoteRequest {
  core: Partial<NoteCore>;
  md?: Partial<NoteMD>;
}

/**
 * Markdownノート作成リクエスト
 */
export interface CreateNoteMDRequest {
  title: string;
  content: string;
}

/**
 * Markdownノート更新リクエスト
 */
export interface UpdateNoteMDRequest {
  title?: string;
  content?: string;
}

/**
 * タグ作成リクエスト
 */
export interface CreateTagRequest {
  name: string;
  id?: string;
}

/**
 * RSSフィード作成リクエスト
 */
export interface CreateRSSFeedRequest {
  url: string;
  title: string;
}

/**
 * 同期プッシュリクエスト（型エイリアス）
 */
export type SyncPushData = SyncPushRequest;

/**
 * LLM設定保存リクエスト
 */
export interface SaveLLMSettingsRequest {
  provider: "openai" | "ollama";
  model: string;
  apiKey?: string;
  baseUrl?: string;
  maxTokens?: number;
  temperature?: number;
}

/**
 * LLM設定レスポンス
 */
export interface LLMSettingsResponse {
  provider: string;
  model: string;
  apiKey?: boolean;
  baseUrl?: string;
  maxTokens?: number;
  temperature?: number;
}

/**
 * 要約レスポンス
 */
export interface SummaryResponse {
  summary: string;
}

/**
 * 要点抽出リクエスト
 */
export interface ExtractKeyPointsRequest {
  content: string;
}

/**
 * 要点抽出レスポンス
 */
export interface ExtractKeyPointsResponse {
  keyPoints: string[];
}

/**
 * ファイルアップロードレスポンス
 */
export interface UploadFileResponse {
  id: string;
  filename: string;
  size: number;
  mime_type: string;
  created_at: number;
}

/**
 * ノートリンクレスポンス
 */
export interface NoteLinksResponse {
  from: string;
  to: string;
}

/**
 * タグ候補生成レスポンス
 */
export interface TagSuggestionsResponse {
  suggestions: Array<{
    name: string;
    confidence: number;
    method: "llm" | "rule-based";
  }>;
}

/**
 * メッセージレスポンス
 */
export interface MessageResponse {
  message: string;
}
