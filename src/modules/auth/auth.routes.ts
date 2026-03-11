import express from "express";
import { validateBody } from "../../middleware/validate-schema.middleware";
import { AuthSchemas } from "./auth.schema";
import methodNotAllowed from "../../middleware/method-not-allowed";
import { authController } from "./auth.controller";
import { isAuth } from "../../middleware/auth.middleware";

const authRouter = express.Router();

authRouter
  .route("/signup")
  .post(validateBody(AuthSchemas.register), authController.register)
  .all(methodNotAllowed);

authRouter
  .route("/login")
  .post(validateBody(AuthSchemas.login), authController.login)
  .all(methodNotAllowed);

authRouter.route("/refresh").post(authController.refresh).all(methodNotAllowed);

authRouter
  .route("/resend-otp")
  .post(validateBody(AuthSchemas.resendOtp), authController.resendOtp)
  .all(methodNotAllowed);

authRouter
  .route("/verify-otp")
  .post(validateBody(AuthSchemas.verifyOtp), authController.verifyOtp)
  .all(methodNotAllowed);

authRouter
  .route("/profile")
  .get(isAuth, authController.getProfile)
  .all(methodNotAllowed);

authRouter
  .route("/session")
  .get(isAuth, authController.getSession)
  .all(methodNotAllowed);

authRouter
  .route("/logout")
  .post(isAuth, authController.logout)
  .all(methodNotAllowed);

export default authRouter;
