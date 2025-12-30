import type { LLMProviderInterface, LLMResponse, Tag } from "@locus/shared";
import type * as tagsDb from "../db/tags.js";
import { handleServiceOperation } from "./utils/error-handler.js";
import { ExternalServiceError } from "../utils/errors.js";

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

【重要な要件】
- タグは必ず単語または短いフレーズ（2-3語まで）にしてください
- 複数の単語を含む場合は、アンダースコア（_）やハイフン（-）で区切ってください
- 例: "machine_learning", "web-development", "データ分析", "プロジェクト管理"
- 長い文章や説明文は避けてください
- 名詞または名詞句を優先してください

【既存タグの優先使用】
以下の既存タグリストは、テキストの内容との関連性が高い順に並んでいます。
テキストの内容に関連するタグを優先的に選択してください。
既存タグが適切な場合は、新しいタグを作成せずに既存タグを使用してください。

既存タグリスト（関連性順）:
{existingTags}

タグは改行区切りで、1行に1つずつ出力してください。
各行にはタグ名のみを記述し、説明やコメントは含めないでください。

タイトル: {title}
テキスト:
{content}`;

/**
 * タグ候補生成サービスの依存関係
 */
export interface TagSuggestionDependencies {
	tagsDb: typeof tagsDb;
}

/**
 * タグ候補生成サービス
 */
export class TagSuggestionService {
	constructor(
		private llm: LLMProviderInterface | null,
		private deps?: TagSuggestionDependencies,
	) {}

	/**
	 * ノートのタグ候補を生成
	 */
	async generateSuggestions(
		title: string,
		content: string,
		existingTags: Tag[] = [],
		allTags: Tag[] = [],
	): Promise<TagSuggestion[]> {
		return handleServiceOperation("generateTagSuggestions", async () => {
			const suggestions: TagSuggestion[] = [];

			// ルールベースのタグ生成（既存タグを優先的にマッチング）
			const ruleBasedTags = this.generateRuleBasedTags(title, content, existingTags, allTags);
			suggestions.push(...ruleBasedTags);

			// LLMベースのタグ生成（既存タグを優先的に使用）
			if (this.llm) {
				try {
					const llmTags = await this.generateLLMTags(title, content, allTags);
					suggestions.push(...llmTags);
				} catch (error) {
					// LLMエラーは警告として記録し、ルールベースで続行
					if (error instanceof ExternalServiceError) {
						console.warn("LLM tag generation failed (external service error):", error.message);
					} else {
						console.error("LLM tag generation failed:", error);
					}
					// LLMが失敗してもルールベースで続行
				}
			}

			// 重複を除去し、信頼度でソート（既存タグを優先）
			return this.deduplicateAndSort(suggestions, allTags);
		});
	}

  /**
   * タグとコンテンツの関連性スコアを計算
   */
  private calculateTagRelevance(tag: Tag, title: string, content: string): number {
    const text = `${title} ${content}`.toLowerCase();
    const tagLower = tag.name.toLowerCase();
    const tagWords = tagLower.split(/[\s_\-]+/).filter((word) => word.length > 0);

    // 完全一致
    if (text.includes(tagLower)) {
      return 1.0;
    }

    // 部分一致（タグの単語がすべてテキストに含まれている場合）
    if (tagWords.length > 1 && tagWords.every((word) => text.includes(word))) {
      return 0.8;
    }

    // 一部一致（主要な単語が含まれている場合）
    const matchingWords = tagWords.filter((word) => word.length >= 3 && text.includes(word));
    if (matchingWords.length > 0) {
      // マッチした単語の割合に基づいてスコアを計算
      const matchRatio = matchingWords.length / tagWords.length;
      return 0.4 + matchRatio * 0.3; // 0.4 ~ 0.7の範囲
    }

    // 関連性なし
    return 0.0;
  }

  /**
   * LLMを使ってタグを生成
   */
  private async generateLLMTags(
    title: string,
    content: string,
    allTags: Tag[] = []
  ): Promise<TagSuggestion[]> {
    if (!this.llm) {
      return [];
    }

    // コンテンツが長すぎる場合は切り詰める（約6000文字まで）
    const maxContentLength = 6000;
    const truncatedContent =
      content.length > maxContentLength ? `${content.substring(0, maxContentLength)}...` : content;

    // 既存タグを関連性順にソート
    const sortedTags = allTags
      .map((tag) => ({
        tag,
        relevance: this.calculateTagRelevance(tag, title, content),
      }))
      .filter((item) => item.relevance > 0) // 関連性が0のタグは除外
      .sort((a, b) => b.relevance - a.relevance) // 関連性の高い順にソート
      .map((item) => item.tag);

    // 既存タグリストを文字列に変換（最大20個まで、プロンプトの長さを制限）
    // タグ名の長さも考慮して、合計で約500文字以内に収める
    let existingTagsList = "（既存タグなし）";
    if (sortedTags.length > 0) {
      const maxTags = 20;
      const maxTagListLength = 500;
      let tagList = "";
      let tagCount = 0;

      for (const tag of sortedTags.slice(0, maxTags)) {
        const tagLine = `- ${tag.name}\n`;
        if (tagList.length + tagLine.length > maxTagListLength) {
          break;
        }
        tagList += tagLine;
        tagCount++;
      }

      if (tagCount > 0) {
        existingTagsList = tagList.trim();
        if (sortedTags.length > tagCount) {
          existingTagsList += `\n（他 ${sortedTags.length - tagCount} 個のタグがあります）`;
        }
      }
    }

    const prompt = TAG_GENERATION_PROMPT.replace("{title}", title)
      .replace("{content}", truncatedContent)
      .replace("{existingTags}", existingTagsList);

		let response: LLMResponse;
		try {
			response = await this.llm.generate({
				prompt,
				systemPrompt:
					"あなたは優秀なタグ生成アシスタントです。テキストの内容を適切に表す単語または短いフレーズのタグを生成します。タグは必ず単語形式で、長い文章は避けてください。既存タグリストがある場合は、それらを優先的に使用してください。",
				maxTokens: 200,
				temperature: 0.7,
			});
		} catch (error) {
			// LLMエラーが発生した場合は空の配列を返す（ルールベースのタグ生成にフォールバック）
			// 空のレスポンスの場合は警告のみで、エラーとして扱わない
			if (error instanceof Error) {
				const errorMessage = error.message.toLowerCase();
				// より広範囲にエラーメッセージをチェック（handleErrorが付加するプレフィックスも考慮）
				if (
					errorMessage.includes("empty response") ||
					errorMessage.includes("invalid response") ||
					errorMessage.includes("returned empty") ||
					errorMessage.includes("openai compatible api returned empty") ||
					(errorMessage.includes("llm request failed") && errorMessage.includes("empty"))
				) {
					console.warn("LLM returned empty response, falling back to rule-based tag generation");
					return [];
				}
			}
			// 外部サービスエラーとしてラップ（ただし、空の配列を返して続行）
			if (error instanceof ExternalServiceError) {
				console.warn("LLM tag generation failed (external service error):", error.message);
			} else {
				console.error("LLM tag generation error:", error);
			}
			return [];
		}

    // レスポンスが空の場合は空の配列を返す
    if (!response || !response.text || response.text.trim().length === 0) {
      console.warn("LLM returned empty response, falling back to rule-based tag generation");
      return [];
    }

    // レスポンスをパース（改行区切り）
    const tagNames = response.text
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line.length > 0 && !line.startsWith("#"))
      .map((line) => {
        // タグ記号を除去
        let tag = line.replace(/^#+\s*/, "").trim();
        // 説明やコメントを除去（コロン、ハイフン、矢印の後を削除）
        tag = tag.split(/[:：\-–—→]/)[0].trim();
        // 数字で始まるリスト記号を除去（例: "1. tag" → "tag"）
        tag = tag.replace(/^\d+[\.\)]\s*/, "");
        // 引用符を除去
        tag = tag.replace(/^["'「」『』]|["'「」『』]$/g, "");
        return tag.trim();
      })
      .filter((name) => {
        // タグ名の長さ制限（1-50文字）
        if (name.length === 0 || name.length > 50) return false;
        // 長い文章を除外（20文字以上で、句読点や複数のスペースを含む場合は除外）
        if (name.length > 20 && /[。、，．\s]{2,}/.test(name)) return false;
        return true;
      });

    // 既存タグかどうかをチェックして信頼度を調整
    const allTagNames = new Set(allTags.map((tag) => tag.name.toLowerCase()));

    return tagNames.map((name) => {
      const isExistingTag = allTagNames.has(name.toLowerCase());
      return {
        name,
        confidence: isExistingTag ? 0.95 : 0.8, // 既存タグの場合は最高信頼度
        method: "llm" as const,
      };
    });
  }

  /**
   * ルールベースでタグを生成
   */
  private generateRuleBasedTags(
    title: string,
    content: string,
    existingTags: Tag[],
    allTags: Tag[] = []
  ): TagSuggestion[] {
    const suggestions: TagSuggestion[] = [];

    const text = `${title} ${content}`.toLowerCase();

    // すべての既存タグをチェック（部分一致も含む）
    for (const tag of allTags) {
      const tagLower = tag.name.toLowerCase();
      const tagWords = tagLower.split(/[\s_\-]+/);

      // 完全一致
      if (text.includes(tagLower)) {
        suggestions.push({
          name: tag.name,
          confidence: 0.95, // 完全一致は最高信頼度
          method: "rule-based",
        });
      }
      // 部分一致（タグの単語がすべてテキストに含まれている場合）
      else if (tagWords.length > 1 && tagWords.every((word) => text.includes(word))) {
        suggestions.push({
          name: tag.name,
          confidence: 0.85, // 部分一致は高信頼度
          method: "rule-based",
        });
      }
      // 単語の一部が一致（タグの主要な単語がテキストに含まれている場合）
      else if (tagWords.some((word) => word.length >= 3 && text.includes(word))) {
        suggestions.push({
          name: tag.name,
          confidence: 0.75, // 一部一致は中高信頼度
          method: "rule-based",
        });
      }
    }

    // キーワード抽出（簡単な方法）
    const keywords = this.extractKeywords(title, content);
    for (const keyword of keywords) {
      // 既存の候補に含まれていない場合のみ追加
      if (!suggestions.some((s) => s.name.toLowerCase() === keyword.toLowerCase())) {
        // 既存タグと一致するキーワードかチェック
        const matchingTag = allTags.find((tag) => tag.name.toLowerCase() === keyword.toLowerCase());
        if (matchingTag) {
          // 既存タグと一致する場合は高信頼度で追加
          suggestions.push({
            name: matchingTag.name,
            confidence: 0.9,
            method: "rule-based",
          });
        } else {
          // 新規キーワードは中程度の信頼度
          suggestions.push({
            name: keyword,
            confidence: 0.6,
            method: "rule-based",
          });
        }
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
   * 重複を除去し、信頼度でソート（既存タグを優先）
   */
  private deduplicateAndSort(suggestions: TagSuggestion[], allTags: Tag[] = []): TagSuggestion[] {
    const seen = new Map<string, TagSuggestion>();
    const allTagNames = new Set(allTags.map((tag) => tag.name.toLowerCase()));

    for (const suggestion of suggestions) {
      const key = suggestion.name.toLowerCase();
      const existing = seen.get(key);
      const isExistingTag = allTagNames.has(key);

      // 既存の候補がない、または新しい候補の方が信頼度が高い場合
      if (!existing || suggestion.confidence > existing.confidence) {
        // 既存タグの場合は信頼度をさらに上げる
        if (isExistingTag && suggestion.confidence < 0.95) {
          suggestion.confidence = 0.95;
        }
        seen.set(key, suggestion);
      }
    }

    // 信頼度でソート（降順）、同じ信頼度の場合は既存タグを優先
    return Array.from(seen.values()).sort((a, b) => {
      const aIsExisting = allTagNames.has(a.name.toLowerCase());
      const bIsExisting = allTagNames.has(b.name.toLowerCase());

      // 信頼度が同じ場合、既存タグを優先
      if (Math.abs(a.confidence - b.confidence) < 0.01) {
        if (aIsExisting && !bIsExisting) return -1;
        if (!aIsExisting && bIsExisting) return 1;
      }

      return b.confidence - a.confidence;
    });
  }
}
