import type { Context, Next } from "hono";

/**
 * リクエストログミドルウェア
 */
export async function logger(c: Context, next: Next) {
	const start = Date.now();
	await next();
	const duration = Date.now() - start;
	console.log(`${c.req.method} ${c.req.path} - ${c.res.status} (${duration}ms)`);
}


