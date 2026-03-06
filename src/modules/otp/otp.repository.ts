import type {
  OtpReasonEnum,
  Prisma,
  PrismaClient,
} from "../../../generated/prisma/client";
import { prisma } from "../../db/prisma";

export class OtpRepository {
  constructor(private prisma: PrismaClient) {}

  public async createOtp(args: { otpData: Prisma.OTPCreateInput }) {
    return this.prisma.oTP.create({
      data: {
        email: args.otpData.email,
        otp: args.otpData.otp,
        resendAfter: args.otpData.resendAfter,
        expiresAt: args.otpData.expiresAt,
        attempts: args.otpData.attempts || 0,
        maxAttempts: args.otpData.maxAttempts || 1,
        reason: args.otpData.reason,
      },
    });
  }

  async findOtp(email: string) {
    return await this.prisma.oTP.findFirst({
      where: {
        email,
      },
    });
  }

  async findOtpWithReason(email: string, reason: OtpReasonEnum) {
    return await this.prisma.oTP.findFirst({
      where: {
        email,
        reason,
      },
    });
  }

  async updateOtp(args: { id: string; otpData: Prisma.OTPUpdateInput }) {
    return await this.prisma.oTP.update({
      where: {
        id: args.id,
      },
      data: args.otpData,
    });
  }

  public async deleteOtpsByEmailAndReason(
    email: string,
    reason: OtpReasonEnum,
  ) {
    return this.prisma.oTP.deleteMany({
      where: { email, reason },
    });
  }

  public async deleteOtpsByEmail(email: string) {
    return this.prisma.oTP.deleteMany({
      where: { email },
    });
  }
}

export const otpRepository = new OtpRepository(prisma);
