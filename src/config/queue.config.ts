import { Queue } from "bullmq";
import { ApiError } from "../utils/api-response.utils";
import { env } from "./env.config";

export const redisConnection = {
  url: env.REDIS_HOST,
};

if (!redisConnection.url) {
  throw ApiError.badRequest("REDIS_URL is missing from environment variables");
}

export const mailQueue = new Queue("mail-queue", {
  connection: redisConnection,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: "exponential",
      delay: 1000,
    },
  },
});
