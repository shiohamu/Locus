/**
 * 自動保存カスタムフック
 */

/**
 * 自動保存の設定
 */
export interface AutoSaveConfig {
  /** 自動保存の遅延時間（ミリ秒） */
  delay: number;
  /** 変更がない場合に保存をスキップするか */
  skipIfUnchanged: boolean;
}

const DEFAULT_CONFIG: AutoSaveConfig = {
  delay: 3000, // 3秒
  skipIfUnchanged: true,
};

/**
 * 自動保存マネージャー
 */
export class AutoSaveManager {
  private timer: ReturnType<typeof setTimeout> | null = null;
  private lastSavedTitle = "";
  private lastSavedContent = "";
  private config: AutoSaveConfig;

  constructor(config: Partial<AutoSaveConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * 自動保存をスケジュール
   */
  schedule(
    title: string,
    content: string,
    onSave: (title: string, content: string) => Promise<void>
  ): void {
    // 変更がない場合は保存しない
    if (
      this.config.skipIfUnchanged &&
      title.trim() === this.lastSavedTitle &&
      content === this.lastSavedContent
    ) {
      return;
    }

    // 既存のタイマーをクリア
    if (this.timer) {
      clearTimeout(this.timer);
    }

    // 新しいタイマーを設定
    this.timer = setTimeout(async () => {
      await onSave(title, content);
      this.lastSavedTitle = title.trim();
      this.lastSavedContent = content;
    }, this.config.delay);
  }

  /**
   * 保存済みの状態を更新
   */
  updateSavedState(title: string, content: string): void {
    this.lastSavedTitle = title.trim();
    this.lastSavedContent = content;
  }

  /**
   * タイマーをクリア
   */
  clear(): void {
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
  }

  /**
   * リソースをクリーンアップ
   */
  destroy(): void {
    this.clear();
  }
}
