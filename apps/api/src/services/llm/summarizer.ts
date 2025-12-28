import type { LLMProviderInterface } from "@locus/shared";

/**
 * ノート要約のプロンプトテンプレート
 */
const NOTE_SUMMARY_PROMPT = `以下のノートの内容を要約してください。重要なポイントを簡潔にまとめてください。

ノート:
{content}`;

/**
 * RSS記事要約のプロンプトテンプレート
 */
const RSS_SUMMARY_PROMPT = `以下のRSS記事の内容を要約してください。重要なポイントを簡潔にまとめてください。

タイトル: {title}
記事:
{content}`;

/**
 * 要点抽出のプロンプトテンプレート
 */
const KEY_POINTS_PROMPT = `以下のテキストから重要な要点を3-5個抽出してください。箇条書きで簡潔にまとめてください。

テキスト:
{content}`;

/**
 * ノート要約サービス
 */
export class SummarizerService {
  constructor(private llm: LLMProviderInterface) {}

  /**
   * ノートを要約
   */
  async summarizeNote(content: string): Promise<string> {
    // コンテンツが長すぎる場合は切り詰める（約8000文字まで）
    const maxContentLength = 8000;
    const truncatedContent =
      content.length > maxContentLength ? `${content.substring(0, maxContentLength)}...` : content;

    const prompt = NOTE_SUMMARY_PROMPT.replace("{content}", truncatedContent);
    const response = await this.llm.generate({
      prompt,
      systemPrompt:
        "あなたは優秀な要約アシスタントです。テキストの重要なポイントを簡潔にまとめます。",
      maxTokens: 500,
    });
    return response.text.trim();
  }

  /**
   * RSS記事を要約
   */
  async summarizeRSSArticle(title: string, content: string): Promise<string> {
    // コンテンツが長すぎる場合は切り詰める（約8000文字まで）
    const maxContentLength = 8000;
    const truncatedContent =
      content.length > maxContentLength ? `${content.substring(0, maxContentLength)}...` : content;

    const prompt = RSS_SUMMARY_PROMPT.replace("{title}", title).replace(
      "{content}",
      truncatedContent
    );
    const response = await this.llm.generate({
      prompt,
      systemPrompt: "あなたは優秀な要約アシスタントです。記事の重要なポイントを簡潔にまとめます。",
      maxTokens: 500,
    });
    return response.text.trim();
  }

  /**
   * 要点を抽出
   */
  async extractKeyPoints(content: string): Promise<string> {
    // コンテンツが長すぎる場合は切り詰める（約8000文字まで）
    const maxContentLength = 8000;
    const truncatedContent =
      content.length > maxContentLength ? `${content.substring(0, maxContentLength)}...` : content;

    const prompt = KEY_POINTS_PROMPT.replace("{content}", truncatedContent);
    const response = await this.llm.generate({
      prompt,
      systemPrompt:
        "あなたは優秀な要点抽出アシスタントです。テキストから重要な要点を箇条書きで抽出します。",
      maxTokens: 300,
    });
    return response.text.trim();
  }
}
