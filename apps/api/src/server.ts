import { app } from "./index.js";

const port = process.env.PORT ? Number.parseInt(process.env.PORT, 10) : 3000;

try {
  const server = Bun.serve({
    port,
    fetch: app.fetch,
    // 長時間実行されるリクエストに対応
    idleTimeout: 180, // 180秒のアイドルタイムアウト
  });
  console.log(`Server running on http://localhost:${server.port}`);
} catch (error) {
  if (error instanceof Error && error.message.includes("EADDRINUSE")) {
    console.error(
      `\n❌ Error: Port ${port} is already in use.\n`
    );
    console.error(`To fix this issue, you can:`);
    console.error(`  1. Stop the process using port ${port}:`);
    console.error(`     lsof -ti:${port} | xargs kill -9`);
    console.error(`     or`);
    console.error(`     fuser -k ${port}/tcp`);
    console.error(`  2. Use a different port:`);
    console.error(`     PORT=3001 bun run dev:api\n`);
    process.exit(1);
  }
  console.error("Failed to start server:", error);
  throw error;
}
