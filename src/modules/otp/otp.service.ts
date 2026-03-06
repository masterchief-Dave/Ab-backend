import dayjs from "dayjs";
import type { OtpReasonEnum } from "../../../generated/prisma/enums";
import { ApiError } from "../../utils/api-response.utils";
import generateOTP from "../../utils/generate-otp.utils";
import { compareOTP, hashOTP } from "../../utils/validation.utils";
import { otpRepository, OtpRepository } from "./otp.repository";

export class OtpService {
  constructor(private otpRepository: OtpRepository) {}

  public async issueOTP(email: string, reason: OtpReasonEnum) {
    const normalizedEmail = email.trim().toLowerCase();

    const existing = await this.otpRepository.findOtpWithReason(
      normalizedEmail,
      reason,
    );

    if (existing && dayjs().isBefore(dayjs(existing.resendAfter))) {
      throw ApiError.tooManyRequests(
        "Please wait before requesting another code",
      );
    }

    const otpCode = generateOTP();
    const hashedOtp = await hashOTP(otpCode);

    await this.otpRepository.deleteOtpsByEmailAndReason(
      normalizedEmail,
      reason,
    );

    const otp = await this.otpRepository.createOtp({
      otpData: {
        email: normalizedEmail,
        otp: hashedOtp,
        expiresAt: dayjs().add(5, "minute").toDate(),
        resendAfter: dayjs().add(1, "minute").toDate(),
        attempts: 0,
        maxAttempts: 3,
        reason,
      },
    });

    return { otp: { ...otp, otp: otpCode } };
  }

  public async verifyOTP(otp: string, email: string, reason: OtpReasonEnum) {
    const normalizedEmail = email.trim().toLowerCase();

    const record = await this.otpRepository.findOtpWithReason(
      normalizedEmail,
      reason,
    );

    if (!record || (record.expiresAt && record.expiresAt < new Date())) {
      throw ApiError.badRequest("Expired or missing OTP");
    }

    if (record.attempts >= record.maxAttempts) {
      throw ApiError.tooManyRequests(
        "Too many attempts. Please request a new code.",
      );
    }

    const nextAttempts = record.attempts + 1;

    const isValid = await (async () => {
      try {
        await compareOTP(otp, record.otp);
        return true;
      } catch {
        return false;
      }
    })();

    await this.otpRepository.updateOtp({
      id: record.id,
      otpData: { attempts: nextAttempts },
    });

    if (!isValid) {
      throw ApiError.badRequest("Invalid or expired OTP");
    }

    return true;
  }

  public async invalidate(email: string, reason: OtpReasonEnum) {
    const normalizedEmail = email.trim().toLowerCase();

    if (reason) {
      await this.otpRepository.deleteOtpsByEmailAndReason(
        normalizedEmail,
        reason,
      );
      return;
    }

    await this.otpRepository.deleteOtpsByEmail(normalizedEmail);
  }
}

export const otpService = new OtpService(otpRepository);
