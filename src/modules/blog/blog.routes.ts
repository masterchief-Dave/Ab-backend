import express from "express";
import methodNotAllowed from "../../middleware/method-not-allowed";
import { isAuth } from "../../middleware/auth.middleware";
import {
  validateBody,
  validateParams,
  validateQuery,
} from "../../middleware/validate-schema.middleware";
import { blogController } from "./blog.controller";
import { BlogSchema } from "./blog.schema";
import { ParamsSchema } from "../../utils/helpers/zod-validation.utils";

const blogRouter = express.Router();

blogRouter
  .route("/")
  .post(isAuth, validateBody(BlogSchema.create), blogController.create)
  .get(validateQuery(BlogSchema.filter), blogController.findAll)
  .all(methodNotAllowed);

blogRouter
  .route("/author/:authorId")
  .get(
    validateParams(ParamsSchema.idParams("authorId", "Author ID")),
    validateQuery(BlogSchema.filter),
    blogController.findAllByAuthor,
  )
  .all(methodNotAllowed);

blogRouter
  .route("/liked")
  .get(
    isAuth,
    validateQuery(BlogSchema.filter),
    blogController.findLikedPostsByUser,
  )
  .all(methodNotAllowed);

blogRouter
  .route("/:id")
  .get(
    validateParams(ParamsSchema.idParams("id", "Blog ID")),
    blogController.getOne,
  )
  .patch(
    isAuth,
    validateParams(ParamsSchema.idParams("id", "Blog ID")),
    validateBody(BlogSchema.update),
    blogController.update,
  )
  .delete(
    isAuth,
    validateParams(ParamsSchema.idParams("id", "Blog ID")),
    blogController.softDelete,
  )
  .all(methodNotAllowed);

blogRouter
  .route("/:id/hard-delete")
  .delete(
    isAuth,
    validateParams(ParamsSchema.idParams("id", "Blog ID")),
    blogController.hardDelete,
  )
  .all(methodNotAllowed);

blogRouter
  .route("/:blogId/likes")
  .get(
    validateParams(ParamsSchema.idParams("blogId", "Blog ID")),
    validateQuery(BlogSchema.blogLikesQuery),
    blogController.findUsersWhoLikedBlog,
  )
  .all(methodNotAllowed);

blogRouter
  .route("/:blogId/like")
  .post(
    isAuth,
    validateParams(ParamsSchema.idParams("blogId", "Blog ID")),
    blogController.likeBlog,
  )
  .delete(
    isAuth,
    validateParams(ParamsSchema.idParams("blogId", "Blog ID")),
    blogController.unlikeBlog,
  )
  .all(methodNotAllowed);

export default blogRouter;
