import { Router } from "express";
import authRouter from "../modules/auth/auth.routes";
import blogRouter from "../modules/blog/blog.routes";
import followRouter from "../modules/follow/follow.routes";
import uploadRouter from "../modules/upload/upload.routes";

const apiRouter = Router();

apiRouter.use("/auth", authRouter);
apiRouter.use("/blogs", blogRouter);
apiRouter.use("/follows", followRouter);
apiRouter.use("/uploads", uploadRouter);

apiRouter.get("/health", (_req, res) =>
  res.json({
    success: true,
    message: "healthy",
    data: { uptime: process.uptime() },
  }),
);

export default apiRouter;
