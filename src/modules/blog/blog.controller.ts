import type { Request, Response } from "express";
import { blogService, type BlogService } from "./blog.service";
import type { AuthenticatedUser } from "../auth/auth.interface";
import type {
  BlogFiltersDto,
  CreateBlogDto,
  UpdateBlogDto,
} from "./blog.schema";

export class BlogController {
  constructor(private blogService: BlogService) {}

  public create = async (req: Request, res: Response) => {
    const user = req.user as AuthenticatedUser;
    const dto = req.body as CreateBlogDto;
    const result = await this.blogService.create(dto, user.id);
    res.status(result.status_code).json(result);
  };

  public update = async (req: Request, res: Response) => {
    const user = req.user as AuthenticatedUser;
    const id = req.params.id as string;
    const dto = req.body as UpdateBlogDto;
    const result = await this.blogService.update(id, dto, user.id);
    res.status(result.status_code).json(result);
  };

  public hardDelete = async (req: Request, res: Response) => {
    const user = req.user as AuthenticatedUser;
    const id = req.params.id as string;
    const result = await this.blogService.hardDelete(id, user.id);
    res.status(result.status_code).json(result);
  };

  public softDelete = async (req: Request, res: Response) => {
    const user = req.user as AuthenticatedUser;
    const id = req.params.id as string;
    const result = await this.blogService.softDelete(id, user.id);
    res.status(result.status_code).json(result);
  };

  public findAll = async (req: Request, res: Response) => {
    const query = req.query as unknown as BlogFiltersDto;
    const result = await this.blogService.findAll(query);
    res.status(result.status_code).json(result);
  };

  public findAllByAuthor = async (req: Request, res: Response) => {
    const authorId = req.params.authorId as string;
    const query = req.query as unknown as Omit<BlogFiltersDto, "authorId">;
    const result = await this.blogService.findAllByAuthor(authorId, query);
    res.status(result.status_code).json(result);
  };

  public findLikedPostsByUser = async (req: Request, res: Response) => {
    const user = req.user as AuthenticatedUser;
    const query = req.query as unknown as Omit<BlogFiltersDto, "authorId">;
    const result = await this.blogService.findLikedPostsByUser(user.id, query);
    res.status(result.status_code).json(result);
  };

  public findUsersWhoLikedBlog = async (req: Request, res: Response) => {
    const blogId = req.params.blogId as string;
    const query = req.query as unknown as Pick<
      BlogFiltersDto,
      "page" | "limit"
    >;
    const result = await this.blogService.findUsersWhoLikedBlog(blogId, query);
    res.status(result.status_code).json(result);
  };

  public likeBlog = async (req: Request, res: Response) => {
    const user = req.user as AuthenticatedUser;
    const blogId = req.params.blogId as string;
    const result = await this.blogService.likeBlog(blogId, user.id);
    res.status(result.status_code).json(result);
  };

  public unlikeBlog = async (req: Request, res: Response) => {
    const user = req.user as AuthenticatedUser;
    const blogId = req.params.blogId as string;
    const result = await this.blogService.unlikeBlog(blogId, user.id);
    res.status(result.status_code).json(result);
  };

  public getOne = async (req: Request, res: Response) => {
    const blogId = req.params.id as string;
    const result = await this.blogService.findOne(blogId);
    res.status(result.status_code).json(result);
  };
}

export const blogController = new BlogController(blogService);
