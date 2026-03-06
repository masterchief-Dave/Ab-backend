import { createBullBoard } from "@bull-board/api";
import { BullMQAdapter } from "@bull-board/api/bullMQAdapter";
import { ExpressAdapter } from "@bull-board/express";
import compression from "compression";
import cookieParser from "cookie-parser";
import cors from "cors";
import express, { type Application } from "express";
import fileUpload from "express-fileupload";
import helmet from "helmet";
import { env } from "./config/env.config";
import { mailQueue } from "./config/queue.config";
import { limiter } from "./middleware/api-limiter.middleware";
import { errorMiddleware } from "./middleware/error.middleware";
import { loggerMiddleware } from "./middleware/logger.middleware";
import notFound from "./middleware/not-found.middleware";
import apiRouter from "./routes/index.routes";

export const createApp = () => {
  const app: Application = express();
  app.use(limiter);
  app.use(compression());
  app.use(cookieParser());
  app.set("trust proxy", 1);
  app.use(
    helmet({
      crossOriginResourcePolicy: { policy: "cross-origin" },
    }),
  );
  app.use(express.json({ limit: "1mb" }));
  app.use(cors({ origin: [...env.CORS_ORIGIN.split(",")], credentials: true }));
  app.use(express.urlencoded({ extended: true }));
  app.use(
    fileUpload({
      limits: { fileSize: 1024 * 1024 * 5 },
      useTempFiles: true,
      tempFileDir: "/tmp/",
      parseNested: true,
      uploadTimeout: 120000,
    }),
  );
  const serverAdapter = new ExpressAdapter();
  serverAdapter.setBasePath("/admin/queues");
  createBullBoard({
    queues: [new BullMQAdapter(mailQueue)],
    serverAdapter: serverAdapter,
  });

  app.use(loggerMiddleware);
  app.use("/api/v1", apiRouter);
  app.use(
    "/admin/queues",
    (req, res, next) => {
      next();
    },
    serverAdapter.getRouter(),
  );

  app.use(errorMiddleware);
  app.use(notFound);
  return app;
};
