import { app } from "./index.js";

const port = process.env.PORT
	? Number.parseInt(process.env.PORT, 10)
	: 3000;

try {
	const server = Bun.serve({
		port,
		fetch: app.fetch,
	});
	console.log(`Server running on http://localhost:${server.port}`);
} catch (error) {
	if (error instanceof Error && error.message.includes("EADDRINUSE")) {
		console.error(
			`Error: Port ${port} is already in use. Please stop the process using this port or set a different PORT environment variable.`,
		);
		process.exit(1);
	}
	throw error;
}


