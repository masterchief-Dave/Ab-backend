import { emailQueue } from "./email.queues";

export class EmailProducer {
  public async sendOtpEmail(to: string, otp: string) {
    await emailQueue.add(
      "send-otp-email",
      {
        type: "SEND_OTP_EMAIL",
        to,
        otp,
      },
      {
        attempts: 3,
        backoff: {
          type: "exponential",
          delay: 5000,
        },
        removeOnComplete: 100,
        removeOnFail: 50,
      },
    );
  }
}

export const emailProducer = new EmailProducer();
