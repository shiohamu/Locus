import type { Context } from "hono";
import { cors } from "hono/cors";

/**
 * CORSミドルウェア
 */
export const corsMiddleware = cors({
	origin: "*",
	allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
	allowHeaders: ["Content-Type"],
});




