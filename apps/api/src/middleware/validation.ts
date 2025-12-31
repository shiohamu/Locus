/**
 * バリデーションミドルウェア
 * 共通のバリデーションロジックを提供
 */

import type { Context, Next } from "hono";
import { ValidationError } from "../utils/errors.js";

/**
 * クエリパラメータから数値を取得（オプショナル）
 */
export function getQueryInt(c: Context, key: string): number | undefined {
  const value = c.req.query(key);
  if (!value) return undefined;
  const parsed = Number.parseInt(value, 10);
  if (Number.isNaN(parsed)) {
    throw new ValidationError(`Invalid ${key} parameter: must be a number`);
  }
  return parsed;
}

/**
 * クエリパラメータから必須の数値を取得
 */
export function getQueryIntRequired(c: Context, key: string): number {
  const value = getQueryInt(c, key);
  if (value === undefined) {
    throw new ValidationError(`Missing required query parameter: ${key}`);
  }
  return value;
}

/**
 * クエリパラメータから文字列を取得（オプショナル）
 */
export function getQueryString(c: Context, key: string): string | undefined {
  return c.req.query(key);
}

/**
 * クエリパラメータから必須の文字列を取得
 */
export function getQueryStringRequired(c: Context, key: string): string {
  const value = c.req.query(key);
  if (!value) {
    throw new ValidationError(`Missing required query parameter: ${key}`);
  }
  return value;
}

/**
 * クエリパラメータから文字列配列を取得（カンマ区切り）
 */
export function getQueryStringArray(c: Context, key: string): string[] {
  const value = c.req.query(key);
  if (!value) return [];
  return value
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);
}

/**
 * リクエストボディからJSONを取得し、バリデーションを実行
 */
export async function getJsonBody<T>(c: Context): Promise<T> {
  try {
    return await c.req.json<T>();
  } catch (error) {
    if (error instanceof SyntaxError) {
      throw new ValidationError("Invalid JSON in request body");
    }
    throw error;
  }
}

/**
 * リクエストボディから必須のフィールドを検証
 */
export function validateRequired<T extends Record<string, unknown>>(
  body: T,
  fields: Array<keyof T>
): void {
  for (const field of fields) {
    if (body[field] === undefined || body[field] === null || body[field] === "") {
      throw new ValidationError(`Missing required field: ${String(field)}`);
    }
  }
}

/**
 * 文字列フィールドのバリデーション
 */
export function validateString(
  value: unknown,
  fieldName: string,
  options?: { minLength?: number; maxLength?: number }
): string {
  if (typeof value !== "string") {
    throw new ValidationError(`${fieldName} must be a string`);
  }
  if (options?.minLength !== undefined && value.length < options.minLength) {
    throw new ValidationError(`${fieldName} must be at least ${options.minLength} characters`);
  }
  if (options?.maxLength !== undefined && value.length > options.maxLength) {
    throw new ValidationError(`${fieldName} must be at most ${options.maxLength} characters`);
  }
  return value;
}

/**
 * 配列フィールドのバリデーション
 */
export function validateArray<T>(
  value: unknown,
  fieldName: string,
  options?: { minLength?: number; maxLength?: number }
): T[] {
  if (!Array.isArray(value)) {
    throw new ValidationError(`${fieldName} must be an array`);
  }
  if (options?.minLength !== undefined && value.length < options.minLength) {
    throw new ValidationError(`${fieldName} must have at least ${options.minLength} items`);
  }
  if (options?.maxLength !== undefined && value.length > options.maxLength) {
    throw new ValidationError(`${fieldName} must have at most ${options.maxLength} items`);
  }
  return value as T[];
}

/**
 * UUID形式のバリデーション
 */
export function validateUUID(value: unknown, fieldName: string): string {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  const str = validateString(value, fieldName);
  if (!uuidRegex.test(str)) {
    throw new ValidationError(`${fieldName} must be a valid UUID`);
  }
  return str;
}

/**
 * URL形式のバリデーション
 */
export function validateURL(value: unknown, fieldName: string): string {
  const str = validateString(value, fieldName);
  try {
    new URL(str);
    return str;
  } catch {
    throw new ValidationError(`${fieldName} must be a valid URL`);
  }
}
