import express from "express";
import methodNotAllowed from "../../middleware/method-not-allowed";
import { isAuth } from "../../middleware/auth.middleware";
import {
  validateParams,
  validateQuery,
} from "../../middleware/validate-schema.middleware";
import { followController } from "./follow.controller";
import { FollowSchema } from "./follow.schema";
import { ParamsSchema } from "../../utils/helpers/zod-validation.utils";

const followRouter = express.Router();

followRouter
  .route("/following")
  .get(
    isAuth,
    validateQuery(FollowSchema.followListQuery),
    followController.getFollowing,
  )
  .all(methodNotAllowed);

followRouter
  .route("/followers")
  .get(
    isAuth,
    validateQuery(FollowSchema.followListQuery),
    followController.getFollowers,
  )
  .all(methodNotAllowed);

followRouter
  .route("/feed")
  .get(
    isAuth,
    validateQuery(FollowSchema.followListQuery),
    followController.getFollowingFeed,
  )
  .all(methodNotAllowed);

followRouter
  .route("/:followingId")
  .post(
    isAuth,
    validateParams(ParamsSchema.idParams("followingId", "Following ID")),
    followController.followUser,
  )
  .delete(
    isAuth,
    validateParams(ParamsSchema.idParams("followingId", "Following ID")),
    followController.unFollowUser,
  )
  .all(methodNotAllowed);

export default followRouter;
