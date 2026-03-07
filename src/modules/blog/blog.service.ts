import { ApiError, ApiSuccess } from "../../utils/api-response.utils";
import {
  BlogLikeRepository,
  blogLikeRepository,
} from "../blog-like/blog-like.repository";
import { generateUniqueSlug } from "./blog.helper";
import { blogRepository, type BlogRepository } from "./blog.repository";
import type {
  BlogFiltersDto,
  CreateBlogDto,
  UpdateBlogDto,
} from "./blog.schema";

export class BlogService {
  constructor(
    private blogRepository: BlogRepository,
    private blogLikeRepository: BlogLikeRepository,
  ) {}

  public create = async (dto: CreateBlogDto, userId: string) => {
    const slug = await generateUniqueSlug(dto.title, async (candidateSlug) => {
      const existing = await this.blogRepository.findBySlug(candidateSlug);
      return !!existing;
    });

    const blog = await this.blogRepository.create(dto, slug, userId);

    return ApiSuccess.created("Blog created successfully", blog);
  };

  public update = async (id: string, dto: UpdateBlogDto, userId: string) => {
    const existing = await this.blogRepository.findById(id);
    if (!existing) {
      throw ApiError.notFound("Blog not found");
    }

    if (existing.authorId !== userId) {
      throw ApiError.forbidden("You are not allowed to update this blog");
    }

    const updated = await this.blogRepository.update(id, dto, userId);
    return ApiSuccess.ok("Blog updated successfully", updated);
  };

  public hardDelete = async (id: string, userId: string) => {
    const existing = await this.blogRepository.findById(id);

    if (!existing) {
      throw ApiError.notFound("Blog not found");
    }

    if (existing.authorId !== userId) {
      throw ApiError.forbidden("You are not allowed to delete this blog");
    }

    await this.blogRepository.hardDelete(id, userId);

    return ApiSuccess.ok("Blog deleted successfully");
  };

  public findAll = async (filters: BlogFiltersDto) => {
    const result = await this.blogRepository.findAll(filters);

    return ApiSuccess.ok("Blogs retrieved successfully", result);
  };

  public findAllByAuthor = async (
    authorId: string,
    filters: Omit<BlogFiltersDto, "authorId">,
  ) => {
    const result = await this.blogRepository.findAllByAuthor(authorId, filters);

    return ApiSuccess.ok("Author blogs retrieved successfully", result);
  };

  public findLikedPostsByUser = async (
    userId: string,
    filters: Omit<BlogFiltersDto, "authorId">,
  ) => {
    const result = await this.blogRepository.findLikedPostsByUserId(
      userId,
      filters,
    );

    return ApiSuccess.ok("Liked blog posts retrieved successfully", result);
  };

  public findUsersWhoLikedBlog = async (
    blogId: string,
    filters: Pick<BlogFiltersDto, "page" | "limit">,
  ) => {
    const blog = await this.blogRepository.findById(blogId);

    if (!blog) {
      throw ApiError.notFound("Blog not found");
    }

    const result = await this.blogRepository.findUsersWhoLikedBlog(
      blogId,
      filters,
    );

    return ApiSuccess.ok("Blog likes retrieved successfully", result);
  };

  public likeBlog = async (blogId: string, userId: string) => {
    const blog = await this.blogRepository.findById(blogId);

    if (!blog) {
      throw ApiError.notFound("Blog not found");
    }

    const existingLike = await this.blogLikeRepository.findByBlogIdAndUserId(
      blogId,
      userId,
    );

    if (existingLike) {
      throw ApiError.conflict("You have already liked this blog");
    }

    await this.blogLikeRepository.create(blogId, userId);
    await this.blogRepository.incrementLikesCount(blogId);

    return ApiSuccess.ok("Blog liked successfully");
  };

  public unlikeBlog = async (blogId: string, userId: string) => {
    const blog = await this.blogRepository.findById(blogId);

    if (!blog) {
      throw ApiError.notFound("Blog not found");
    }

    const existingLike = await this.blogLikeRepository.findByBlogIdAndUserId(
      blogId,
      userId,
    );

    if (!existingLike) {
      throw ApiError.badRequest("You have not liked this blog");
    }

    await this.blogLikeRepository.delete(blogId, userId);
    await this.blogRepository.decrementLikesCount(blogId);

    return ApiSuccess.ok("Blog unliked successfully");
  };

  public softDelete = async (id: string, userId: string) => {
    const blog = await this.blogRepository.findRawById(id);

    if (!blog || blog.isDeleted) {
      throw ApiError.notFound("Blog not found");
    }

    if (blog.authorId !== userId) {
      throw ApiError.forbidden("You are not allowed to delete this blog");
    }

    await this.blogRepository.softDelete(id, userId);

    return ApiSuccess.ok("Blog deleted successfully");
  };

  public findOne = async (id: string) => {
    const blog = await this.blogRepository.findById(id);

    if (!blog) {
      throw ApiError.notFound("Blog not found");
    }

    return ApiSuccess.ok("Blog found successfully", blog);
  };
}

export const blogService = new BlogService(blogRepository, blogLikeRepository);
