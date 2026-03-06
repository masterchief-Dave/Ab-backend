import { OtpReasonEnum } from "../../../generated/prisma/enums";
import { emailProducer, type EmailProducer } from "../../queues/email.producer";
import { mailService, type MailService } from "../../services/mail.service";
import { ApiError, ApiSuccess } from "../../utils/api-response.utils";
import {
  comparePassword,
  hashPassword,
} from "../../utils/password-validation.utils";
import { generateAuthToken, verifyAuthToken } from "../../utils/token.utils";
import { otpService, type OtpService } from "../otp/otp.service";
import { userRepository, type UserRepository } from "../user/user.repository";
import type { UserEntity } from "./auth.interface";
import type { LoginDto, RegisterDto } from "./auth.schema";

export class AuthService {
  constructor(
    private userRepository: UserRepository,

    private otpService: OtpService,
    private emailProducer: EmailProducer,
  ) {}

  private userPayload(user: UserEntity) {
    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      isActive: user.isActive,
      isVerified: user.isVerified,
      provider: user.provider,
    };
  }

  private generateTokens(user: UserEntity) {
    const payload = {
      userId: user.id,
      passwordVersion: user.passwordVersion,
      jwtVersion: user.jwtVersion,
    };

    const accessToken = generateAuthToken(payload, "15m");
    const refreshToken = generateAuthToken(payload, "7d");

    return { accessToken, refreshToken };
  }

  public login = async (dto: LoginDto) => {
    const email = dto.email.trim().toLowerCase();
    const user = await this.userRepository.findByEmail(email);

    if (!user || user.isDeleted)
      throw ApiError.unauthorized("Invalid credentials");
    if (!user.isActive) throw ApiError.forbidden("Account is inactive");

    await comparePassword(dto.password, user.password);

    if (!user.isVerified) throw ApiError.forbidden("Email not verified");

    const tokens = this.generateTokens(user);

    return ApiSuccess.ok("Login successful", {
      user: this.userPayload(user),
      ...tokens,
    });
  };

  public refreshAccessToken = async (refreshToken: string) => {
    const decoded = verifyAuthToken(refreshToken);
    const user = await this.userRepository.findById(decoded.userId);

    if (!user || user.jwtVersion !== decoded.jwtVersion) {
      throw ApiError.unauthorized("Invalid session");
    }

    const tokens = this.generateTokens(user);

    return ApiSuccess.ok("Token refreshed", tokens);
  };

  public register = async (dto: RegisterDto) => {
    const existingUser = await this.userRepository.findByEmail(dto.email);
    if (existingUser) {
      throw ApiError.conflict("Email already registered.");
    }

    const hashedPassword = await hashPassword(dto.password);
    const user = await this.userRepository.create({
      userData: {
        firstName: dto.firstName,
        email: dto.email,
        lastName: dto.lastName,
        password: hashedPassword,
        gender: dto.gender,
      },
    });

    if (!user) {
      throw ApiError.badRequest("Failed to create user.");
    }

    const {
      otp: { otp },
    } = await this.otpService.issueOTP(dto.email, OtpReasonEnum.register);

    await this.emailProducer.sendOtpEmail(dto.email, otp);
    return ApiSuccess.created("Registration successful");
  };
}

export const authService = new AuthService(
  userRepository,
  otpService,
  emailProducer,
);
