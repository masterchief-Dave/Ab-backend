import http from "http";
import { createApp } from "./app";
import { dbHealthcheck } from "./db/prisma";
import { env } from "./config/env.config";
import { logger } from "./middleware/logger.middleware";

import "./workers/email.worker";
import { emailWorker } from "./workers/email.worker";

const main = async () => {
  await dbHealthcheck();
  const app = createApp();

  const server = http.createServer(app);

  const shutdown = async (signal: string) => {
    logger.info({ signal }, "Graceful shutdown initiated.");

    await emailWorker.close();
    logger.info("Email worker closed");

    server.close(() => {
      logger.info("HTTP server closed");
      process.exit(0);
    });

    setTimeout(() => {
      logger.error("Could not close connections in time, forceful exit");
      process.exit(1);
    }, 10000);
  };

  process.on("SIGTERM", () => shutdown("SIGTERM"));
  process.on("SIGINT", () => shutdown("SIGINT"));

  server.listen(env.PORT, "0.0.0.0", () => {
    logger.info({ port: env.PORT }, "server started");
  });
};

if (env.NODE_ENV !== "test") {
  main().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
