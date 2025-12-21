import type { ErrorHandler } from "hono";
import { HTTPException } from "hono/http-exception";

/**
 * エラーハンドリングミドルウェア
 */
export const errorHandler: ErrorHandler = (err, c) => {
	if (err instanceof HTTPException) {
		return c.json({ error: err.message }, err.status);
	}

	console.error("Unhandled error:", err);
	return c.json({ error: "Internal Server Error" }, 500);
};
