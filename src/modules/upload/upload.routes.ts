import { Router } from "express";
import { uploadController } from "./upload.controller";
import { isAuth } from "../../middleware/auth.middleware";
import { limiter } from "../../middleware/api-limiter.middleware";
import methodNotAllowed from "../../middleware/method-not-allowed";

const uploadRouter = Router();

uploadRouter
  .route("/signature")
  .post(isAuth, uploadController.getSignature)
  .all(methodNotAllowed);

uploadRouter
  .route("/public/signature")
  .post(limiter, uploadController.getPublicSignature)
  .all(methodNotAllowed);

export default uploadRouter;
