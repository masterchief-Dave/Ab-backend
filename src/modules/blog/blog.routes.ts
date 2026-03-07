import { Router } from "express";
import { blogController } from "./blog.controller";

import { methodNotAllowed } from "../../middleware/method-not-allowed.middleware";

const router = Router();

router
  .route("/")
  .get(blogController.get)
  .post(blogController.create)
  .all(methodNotAllowed);

router
  .route("/:id")
  .get(blogController.get)
  .put(blogController.update)
  .delete(blogController.delete)
  .all(methodNotAllowed);

export default router;