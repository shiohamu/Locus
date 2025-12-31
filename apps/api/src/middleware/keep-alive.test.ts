import { describe, expect, test } from "bun:test";
import { Hono } from "hono";
import { keepAliveMiddleware } from "./keep-alive.js";

describe("keep-alive middleware", () => {
  test("Keep-Aliveヘッダーを追加する", async () => {
    const app = new Hono();
    app.use("*", keepAliveMiddleware);
    app.get("/test", (c) => c.json({ message: "ok" }));

    const res = await app.request("/test");
    expect(res.status).toBe(200);
    expect(res.headers.get("Connection")).toBe("keep-alive");
    expect(res.headers.get("Keep-Alive")).toBe("timeout=180");
  });

  test("next()の後にヘッダーが追加される", async () => {
    const app = new Hono();
    app.use("*", keepAliveMiddleware);
    app.get("/test", (c) => {
      // ミドルウェア実行前はヘッダーが設定されていない
      expect(c.res.headers.get("Connection")).toBeNull();
      return c.json({ message: "ok" });
    });

    const res = await app.request("/test");
    expect(res.status).toBe(200);
    // ミドルウェア実行後はヘッダーが設定されている
    expect(res.headers.get("Connection")).toBe("keep-alive");
    expect(res.headers.get("Keep-Alive")).toBe("timeout=180");
  });
});
