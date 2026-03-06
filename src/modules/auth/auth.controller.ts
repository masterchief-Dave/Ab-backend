import type { Request, Response } from "express";
import { cookieOptions } from "./auth.helper";
import type { LoginDto, RegisterDto } from "./auth.schema";
import { authService, type AuthService } from "./auth.service";
import { ApiError, ApiSuccess } from "../../utils/api-response.utils";

export class AuthController {
  constructor(private authService: AuthService) {}

  private setAuthCookies(
    res: Response,
    accessToken: string,
    refreshToken: string,
  ) {
    res.cookie("accessToken", accessToken, {
      ...cookieOptions,
      maxAge: 15 * 60 * 1000,
    });
    res.cookie("refreshToken", refreshToken, {
      ...cookieOptions,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
  }

  public refresh = async (req: Request, res: Response) => {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) throw ApiError.unauthorized("No refresh token");

    const result = await this.authService.refreshAccessToken(refreshToken);
    this.setAuthCookies(res, result.data.accessToken, result.data.refreshToken);

    res.status(result.status_code).json(result);
  };

  public register = async (req: Request, res: Response) => {
    const dto = req.body as RegisterDto;
    const result = await this.authService.register(dto);
    res.status(result.status_code).json(result);
  };

  public login = async (req: Request, res: Response) => {
    const dto = req.body as LoginDto;
    const result = await this.authService.login(dto);

    if (result.data.accessToken) {
      this.setAuthCookies(
        res,
        result.data.accessToken,
        result.data.refreshToken,
      );
    }

    res.status(result.status_code).json(result);
  };

  public getSession = async () => {};

  public logout = async (req: Request, res: Response) => {
    res.clearCookie("accessToken");
    res.clearCookie("refreshToken");
    res.status(200).json(ApiSuccess.ok("Logout successful"));
  };
}

export const authController = new AuthController(authService);
