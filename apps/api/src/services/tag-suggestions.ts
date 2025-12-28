import type { LLMProviderInterface, Tag } from "@locus/shared";
import * as tagsDb from "../db/tags.js";

/**
 * タグ候補生成の結果
 */
export interface TagSuggestion {
	/** タグ名 */
	name: string;
	/** 信頼度スコア（0-1） */
	confidence: number;
	/** 生成方法（'llm' | 'rule-based'） */
	method: "llm" | "rule-based";
}

/**
 * LLMベースのタグ生成プロンプト
 */
const TAG_GENERATION_PROMPT = `以下のテキストから、適切なタグを3-10個生成してください。
タグは簡潔で、テキストの内容をよく表すものにしてください。
タグは改行区切りで、1行に1つずつ出力してください。
既存のタグや一般的なカテゴリ名を使用してください。

タイトル: {title}
テキスト:
{content}`;

/**
 * タグ候補生成サービス
 */
export class TagSuggestionService {
	constructor(private llm: LLMProviderInterface | null) {}

	/**
	 * ノートのタグ候補を生成
	 */
	async generateSuggestions(
		title: string,
		content: string,
		existingTags: Tag[] = []
	): Promise<TagSuggestion[]> {
		const suggestions: TagSuggestion[] = [];

		// LLMベースのタグ生成
		if (this.llm) {
			try {
				const llmTags = await this.generateLLMTags(title, content);
				suggestions.push(...llmTags);
			} catch (error) {
				console.error("LLM tag generation failed:", error);
				// LLMが失敗してもルールベースで続行
			}
		}

		// ルールベースのタグ生成
		const ruleBasedTags = this.generateRuleBasedTags(title, content, existingTags);
		suggestions.push(...ruleBasedTags);

		// 重複を除去し、信頼度でソート
		return this.deduplicateAndSort(suggestions);
	}

	/**
	 * LLMを使ってタグを生成
	 */
	private async generateLLMTags(
		title: string,
		content: string
	): Promise<TagSuggestion[]> {
		if (!this.llm) {
			return [];
		}

		// コンテンツが長すぎる場合は切り詰める（約8000文字まで）
		const maxContentLength = 8000;
		const truncatedContent =
			content.length > maxContentLength ? `${content.substring(0, maxContentLength)}...` : content;

		const prompt = TAG_GENERATION_PROMPT.replace("{title}", title).replace(
			"{content}",
			truncatedContent
		);

		const response = await this.llm.generate({
			prompt,
			systemPrompt:
				"あなたは優秀なタグ生成アシスタントです。テキストの内容を適切に表すタグを生成します。",
			maxTokens: 200,
			temperature: 0.7,
		});

		// レスポンスをパース（改行区切り）
		const tagNames = response.text
			.split("\n")
			.map((line) => line.trim())
			.filter((line) => line.length > 0 && !line.startsWith("#"))
			.map((line) => {
				// タグ記号を除去
				return line.replace(/^#+\s*/, "").trim();
			})
			.filter((name) => name.length > 0 && name.length <= 50); // タグ名の長さ制限

		return tagNames.map((name) => ({
			name,
			confidence: 0.8, // LLM生成のタグは高信頼度
			method: "llm" as const,
		}));
	}

	/**
	 * ルールベースでタグを生成
	 */
	private generateRuleBasedTags(
		title: string,
		content: string,
		existingTags: Tag[]
	): TagSuggestion[] {
		const suggestions: TagSuggestion[] = [];

		// 既存タグとの類似度を計算
		const existingTagNames = existingTags.map((tag) => tag.name.toLowerCase());
		const text = `${title} ${content}`.toLowerCase();

		// 既存タグがテキストに含まれている場合は候補に追加
		for (const tag of existingTags) {
			const tagLower = tag.name.toLowerCase();
			if (text.includes(tagLower)) {
				suggestions.push({
					name: tag.name,
					confidence: 0.9, // 既存タグとの一致は高信頼度
					method: "rule-based",
				});
			}
		}

		// キーワード抽出（簡単な方法）
		const keywords = this.extractKeywords(title, content);
		for (const keyword of keywords) {
			// 既存の候補に含まれていない場合のみ追加
			if (!suggestions.some((s) => s.name.toLowerCase() === keyword.toLowerCase())) {
				suggestions.push({
					name: keyword,
					confidence: 0.6, // キーワード抽出は中程度の信頼度
					method: "rule-based",
				});
			}
		}

		return suggestions;
	}

	/**
	 * キーワードを抽出（簡単な実装）
	 */
	private extractKeywords(title: string, content: string): string[] {
		const keywords: string[] = [];

		// タイトルから重要な単語を抽出
		const titleWords = title
			.split(/\s+/)
			.map((word) => word.replace(/[^\w\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]/g, ""))
			.filter((word) => word.length >= 2 && word.length <= 20)
			.slice(0, 5); // 最大5個

		keywords.push(...titleWords);

		// コンテンツから頻出単語を抽出（簡易版）
		const words = content
			.split(/\s+/)
			.map((word) => word.replace(/[^\w\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]/g, ""))
			.filter((word) => word.length >= 3 && word.length <= 20);

		// 単語の出現頻度をカウント
		const wordCounts = new Map<string, number>();
		for (const word of words) {
			wordCounts.set(word, (wordCounts.get(word) || 0) + 1);
		}

		// 頻度が高い単語を取得（最大5個）
		const frequentWords = Array.from(wordCounts.entries())
			.sort((a, b) => b[1] - a[1])
			.slice(0, 5)
			.map(([word]) => word);

		keywords.push(...frequentWords);

		// 重複を除去
		return Array.from(new Set(keywords));
	}

	/**
	 * 重複を除去し、信頼度でソート
	 */
	private deduplicateAndSort(suggestions: TagSuggestion[]): TagSuggestion[] {
		const seen = new Map<string, TagSuggestion>();

		for (const suggestion of suggestions) {
			const key = suggestion.name.toLowerCase();
			const existing = seen.get(key);

			// 既存の候補がない、または新しい候補の方が信頼度が高い場合
			if (!existing || suggestion.confidence > existing.confidence) {
				seen.set(key, suggestion);
			}
		}

		// 信頼度でソート（降順）
		return Array.from(seen.values()).sort((a, b) => b.confidence - a.confidence);
	}
}

