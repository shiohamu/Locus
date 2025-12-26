import { defineConfig, devices } from "@playwright/test";

/**
 * E2Eテスト設定
 * 参考: https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  testDir: "./e2e",
  /* テストの最大実行時間 */
  timeout: 30 * 1000,
  expect: {
    /* アサーションのタイムアウト */
    timeout: 5000,
  },
  /* テストを並列実行 */
  fullyParallel: true,
  /* CIで失敗した場合にリトライ */
  forbidOnly: !!process.env.CI,
  /* CIで失敗した場合にリトライ */
  retries: process.env.CI ? 2 : 0,
  /* 並列実行するワーカー数 */
  workers: process.env.CI ? 1 : undefined,
  /* レポート設定 */
  reporter: "html",
  /* 共有設定 */
  use: {
    /* ベースURL */
    baseURL: "http://localhost:5173",
    /* アクションのタイムアウト */
    actionTimeout: 10 * 1000,
    /* トレース */
    trace: "on-first-retry",
  },

  /* プロジェクト設定 */
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],

  /* 開発サーバーの設定 */
  webServer: [
    {
      command: "bun run apps/api/src/server.ts",
      port: 3000,
      reuseExistingServer: !process.env.CI,
      env: {
        ...process.env,
        LANG: process.env.LANG || "ja_JP.UTF-8",
        LC_ALL: process.env.LC_ALL || "ja_JP.UTF-8",
      },
    },
    {
      command: "bun --cwd=apps/web run dev",
      port: 5173,
      reuseExistingServer: !process.env.CI,
      env: {
        ...process.env,
        LANG: process.env.LANG || "ja_JP.UTF-8",
        LC_ALL: process.env.LC_ALL || "ja_JP.UTF-8",
      },
    },
  ],
});
