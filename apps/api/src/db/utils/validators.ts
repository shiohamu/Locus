/**
 * バリデーション関数
 * データベース行からオブジェクトへの変換時にバリデーションを実行
 */

import { ValidationError } from "../../utils/errors.js";
import type { LLMConfig, LLMProvider, NoteType } from "@locus/shared";
import {
	isLinkRow,
	isNoteCoreRow,
	isNoteMDRow,
	isNoteType,
	isNull,
	isNumber,
	isObject,
	isRSSFeedRow,
	isRSSItemRow,
	isString,
	isWebClipRow,
} from "./type-guards.js";

/**
 * 型安全な文字列バリデーション
 * @param value 値
 * @param fieldName フィールド名（エラーメッセージ用）
 * @returns 文字列
 * @throws ValidationError 値が文字列でない場合
 */
export function assertString(value: unknown, fieldName: string): string {
	if (!isString(value)) {
		throw new ValidationError(
			`Expected string for field "${fieldName}", got ${typeof value}`,
		);
	}
	return value;
}

/**
 * 型安全な数値バリデーション
 * @param value 値
 * @param fieldName フィールド名（エラーメッセージ用）
 * @returns 数値
 * @throws ValidationError 値が数値でない場合
 */
export function assertNumber(value: unknown, fieldName: string): number {
	if (!isNumber(value)) {
		throw new ValidationError(
			`Expected number for field "${fieldName}", got ${typeof value}`,
		);
	}
	return value;
}

/**
 * 型安全なnull許容数値バリデーション
 * @param value 値
 * @param fieldName フィールド名（エラーメッセージ用）
 * @returns 数値またはnull
 * @throws ValidationError 値が数値またはnullでない場合
 */
export function assertNumberOrNull(
	value: unknown,
	fieldName: string,
): number | null {
	if (isNull(value)) {
		return null;
	}
	if (!isNumber(value)) {
		throw new ValidationError(
			`Expected number or null for field "${fieldName}", got ${typeof value}`,
		);
	}
	return value;
}

/**
 * 型安全なNoteTypeバリデーション
 * @param value 値
 * @param fieldName フィールド名（エラーメッセージ用）
 * @returns NoteType
 * @throws ValidationError 値がNoteTypeでない場合
 */
export function assertNoteType(value: unknown, fieldName: string): NoteType {
	if (!isNoteType(value)) {
		throw new ValidationError(
			`Expected NoteType (md | rss | web_clip) for field "${fieldName}", got ${typeof value}`,
		);
	}
	return value;
}

/**
 * NoteCore行のバリデーション
 * @param row データベース行
 * @returns バリデーション済みの行
 * @throws ValidationError 行がNoteCoreの形式でない場合
 */
export function assertNoteCoreRow(row: unknown): ReturnType<
	typeof isNoteCoreRow
> extends true
	? Parameters<typeof isNoteCoreRow>[0]
	: never {
	if (!isNoteCoreRow(row)) {
		throw new ValidationError("Invalid NoteCore row structure");
	}
	return row;
}

/**
 * Link行のバリデーション
 * @param row データベース行
 * @returns バリデーション済みの行
 * @throws ValidationError 行がLinkの形式でない場合
 */
export function assertLinkRow(row: unknown): ReturnType<
	typeof isLinkRow
> extends true
	? Parameters<typeof isLinkRow>[0]
	: never {
	if (!isLinkRow(row)) {
		throw new ValidationError("Invalid Link row structure");
	}
	return row;
}

/**
 * NoteMD行のバリデーション
 * @param row データベース行
 * @returns バリデーション済みの行
 * @throws ValidationError 行がNoteMDの形式でない場合
 */
export function assertNoteMDRow(row: unknown): ReturnType<
	typeof isNoteMDRow
> extends true
	? Parameters<typeof isNoteMDRow>[0]
	: never {
	if (!isNoteMDRow(row)) {
		throw new ValidationError("Invalid NoteMD row structure");
	}
	return row;
}

/**
 * RSSFeed行のバリデーション
 * @param row データベース行
 * @returns バリデーション済みの行
 * @throws ValidationError 行がRSSFeedの形式でない場合
 */
export function assertRSSFeedRow(row: unknown): ReturnType<
	typeof isRSSFeedRow
> extends true
	? Parameters<typeof isRSSFeedRow>[0]
	: never {
	if (!isRSSFeedRow(row)) {
		throw new ValidationError("Invalid RSSFeed row structure");
	}
	return row;
}

/**
 * RSSItem行のバリデーション
 * @param row データベース行
 * @returns バリデーション済みの行
 * @throws ValidationError 行がRSSItemの形式でない場合
 */
export function assertRSSItemRow(row: unknown): ReturnType<
	typeof isRSSItemRow
> extends true
	? Parameters<typeof isRSSItemRow>[0]
	: never {
	if (!isRSSItemRow(row)) {
		throw new ValidationError("Invalid RSSItem row structure");
	}
	return row;
}

/**
 * WebClip行のバリデーション
 * @param row データベース行
 * @returns バリデーション済みの行
 * @throws ValidationError 行がWebClipの形式でない場合
 */
export function assertWebClipRow(row: unknown): ReturnType<
	typeof isWebClipRow
> extends true
	? Parameters<typeof isWebClipRow>[0]
	: never {
	if (!isWebClipRow(row)) {
		throw new ValidationError("Invalid WebClip row structure");
	}
	return row;
}

/**
 * LLMProviderのバリデーション
 * @param value 値
 * @param fieldName フィールド名（エラーメッセージ用）
 * @returns LLMProvider
 * @throws ValidationError 値がLLMProviderでない場合
 */
export function assertLLMProvider(
	value: unknown,
	fieldName: string,
): LLMProvider {
	if (
		!isString(value) ||
		(value !== "openai" && value !== "openai-compatible" && value !== "ollama")
	) {
		throw new ValidationError(
			`Expected LLMProvider (openai | openai-compatible | ollama) for field "${fieldName}", got ${typeof value}`,
		);
	}
	return value;
}

/**
 * LLMConfigのバリデーション
 * @param value 値
 * @returns LLMConfig
 * @throws ValidationError 値がLLMConfigの形式でない場合
 */
export function assertLLMConfig(value: unknown): LLMConfig {
	if (!isObject(value)) {
		throw new ValidationError("Expected object for LLMConfig");
	}

	const provider = assertLLMProvider(value.provider, "provider");
	const model = assertString(value.model, "model");

	const config: LLMConfig = {
		provider,
		model,
	};

	if (value.apiKey !== undefined) {
		config.apiKey = assertString(value.apiKey, "apiKey");
	}

	if (value.baseUrl !== undefined) {
		config.baseUrl = assertString(value.baseUrl, "baseUrl");
	}

	if (value.maxTokens !== undefined) {
		config.maxTokens = assertNumber(value.maxTokens, "maxTokens");
	}

	if (value.temperature !== undefined) {
		config.temperature = assertNumber(value.temperature, "temperature");
	}

	return config;
}

