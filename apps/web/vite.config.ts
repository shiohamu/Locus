import { sveltekit } from "@sveltejs/kit/vite";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [sveltekit()],
  server: {
    port: 5173,
    hmr: {
      // HMRの設定を改善
      overlay: true,
    },
    proxy: {
      "/api": {
        target: "http://localhost:3000",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ""),
        timeout: 180000, // 180秒（3分）のタイムアウト
        configure: (proxy, _options) => {
          // タイムアウト設定を明示的に設定
          proxy.timeout = 180000;
          proxy.proxyTimeout = 180000;

          proxy.on("error", (err, req, res) => {
            console.log("proxy error", err);
            if (res && !res.headersSent) {
              res.writeHead(504, {
                "Content-Type": "application/json",
              });
              res.end(JSON.stringify({ error: "Gateway Timeout" }));
            }
          });
          proxy.on("proxyReq", (proxyReq, req, _res) => {
            console.log("Sending Request to the Target:", req.method, req.url);
            // タイムアウトを延長
            proxyReq.setTimeout(180000);
            // Keep-Aliveを有効にする
            proxyReq.setHeader("Connection", "keep-alive");
          });
          proxy.on("proxyRes", (proxyRes, req, _res) => {
            console.log("Received Response from the Target:", proxyRes.statusCode, req.url);
            // Keep-Aliveを有効にする
            proxyRes.headers["connection"] = "keep-alive";
          });
        },
      },
    },
  },
});
