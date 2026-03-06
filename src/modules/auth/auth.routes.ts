import express from "express";
import { validateBody } from "../../middleware/validate-schema.middleware";
import { AuthSchemas } from "./auth.schema";
import methodNotAllowed from "../../middleware/method-not-allowed";
import { authController } from "./auth.controller";

const authRouter = express.Router();

authRouter
  .route("/signup")
  .post(validateBody(AuthSchemas.register), authController.register)
  .all(methodNotAllowed);

authRouter
  .route("/login")
  .post(validateBody(AuthSchemas.login), authController.login)
  .all(methodNotAllowed);

export default authRouter;
