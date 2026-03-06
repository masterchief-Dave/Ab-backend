import { Worker } from "bullmq";
import { redisConnection } from "../config/queue.config";
import { logger } from "../middleware/logger.middleware";
import { mailService } from "../services/mail.service";
import {
  EMAIL_QUEUE_NAME,
  type SendOtpEmailJobData,
} from "../queues/email.queues";

export const emailWorker = new Worker<SendOtpEmailJobData>(
  EMAIL_QUEUE_NAME,
  async (job) => {
    const { type, to, otp } = job.data;

    switch (type) {
      case "SEND_OTP_EMAIL": {
        logger.info({ to, jobId: job.id }, "Processing OTP email job");
        await mailService.sendOTPViaEmail(to, otp);
        logger.info({ to, jobId: job.id }, "OTP email sent successfully");
        break;
      }

      default: {
        throw new Error(`Unsupported email job type: ${type}`);
      }
    }
  },
  { connection: redisConnection },
);

emailWorker.on("completed", (job) => {
  logger.info({ jobId: job.id, name: job.name }, "Email job completed");
});

emailWorker.on("failed", (job, err) => {
  logger.error(
    { jobId: job?.id, name: job?.name, error: err.message },
    "Email job failed",
  );
});
