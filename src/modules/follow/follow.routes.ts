import express from "express";
import methodNotAllowed from "../../middleware/method-not-allowed";
import { isAuth } from "../../middleware/auth.middleware";
import {
  validateParams,
  validateQuery,
} from "../../middleware/validate-schema.middleware";
import { followController } from "./follow.controller";
import { FollowSchema } from "./follow.schema";

const followRouter = express.Router();

followRouter
  .route("/:followingId")
  .post(
    isAuth,
    validateParams(FollowSchema.followUserParams),
    followController.followUser,
  )
  .delete(
    isAuth,
    validateParams(FollowSchema.followUserParams),
    followController.unFollowUser,
  )
  .all(methodNotAllowed);

followRouter
  .route("/following")
  .get(
    isAuth,
    validateQuery(FollowSchema.followListQuery),
    followController.getFollowing,
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

export default followRouter;
