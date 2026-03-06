import { Queue } from "bullmq";
import { redisConnection } from "../config/queue.config";

export const EMAIL_QUEUE_NAME = "mail-queue";

export type SendOtpEmailJobData = {
  type: "SEND_OTP_EMAIL";
  to: string;
  otp: string;
};

export const emailQueue = new Queue<SendOtpEmailJobData>(EMAIL_QUEUE_NAME, {
  connection: redisConnection,
});
