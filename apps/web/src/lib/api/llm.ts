/**
 * LLM関連API
 */

import type { LLMConfig } from "$lib/types";
import { apiRequest } from "./base.js";

/**
 * LLM設定取得（互換性のため残す）
 */
export async function getLLMConfig(): Promise<LLMConfig> {
  return apiRequest<LLMConfig>("/llm/config");
}

/**
 * LLM設定取得（設定ページ用）
 */
export async function getLLMSettings(): Promise<{
  provider: string;
  model: string;
  apiKey?: boolean;
  baseUrl?: string;
  maxTokens?: number;
  temperature?: number;
}> {
  return apiRequest<{
    provider: string;
    model: string;
    apiKey?: boolean;
    baseUrl?: string;
    maxTokens?: number;
    temperature?: number;
  }>("/settings/llm");
}

/**
 * LLM設定保存
 */
export async function saveLLMSettings(config: {
  provider: "openai" | "ollama";
  model: string;
  apiKey?: string;
  baseUrl?: string;
  maxTokens?: number;
  temperature?: number;
}): Promise<void> {
  return apiRequest<void>("/settings/llm", {
    method: "PUT",
    body: JSON.stringify(config),
  });
}

/**
 * LLM設定削除
 */
export async function deleteLLMSettings(): Promise<void> {
  return apiRequest<void>("/settings/llm", {
    method: "DELETE",
  });
}

/**
 * ノート要約
 */
export async function summarizeNote(noteId: string): Promise<{ summary: string }> {
  return apiRequest<{ summary: string }>(`/llm/notes/${noteId}/summarize`, {
    method: "POST",
  });
}

/**
 * RSS記事要約
 */
export async function summarizeRSSArticle(noteId: string): Promise<{ summary: string }> {
  return apiRequest<{ summary: string }>(`/llm/rss/${noteId}/summarize`, {
    method: "POST",
  });
}

/**
 * 要点抽出
 */
export async function extractKeyPoints(content: string): Promise<{ keyPoints: string[] }> {
  return apiRequest<{ keyPoints: string[] }>("/llm/extract-key-points", {
    method: "POST",
    body: JSON.stringify({ content }),
  });
}
