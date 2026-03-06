import type { Queue } from "bullmq";
import { mailQueue } from "../../config/queue.config";

export class NotificationService {
  constructor(private queue: Queue) {}

  public sendNotification = async (email: string, otp: string) => {
    await this.queue.add("send-email-job", {
      to: email,
      type: "OTP_VERIFICATION",
      data: { otp },
    });
  };
}

export const notificationService = new NotificationService(mailQueue);
