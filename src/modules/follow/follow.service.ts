import { ApiError, ApiSuccess } from "../../utils/api-response.utils";
import { followRepository, type FollowRepository } from "./follow.repository";
import { userRepository, type UserRepository } from "../user/user.repository";
import { blogRepository, type BlogRepository } from "../blog/blog.repository";
import type { FollowListQueryDto } from "./follow.schema";

// note: followerId is the logged in user's id

export class FollowService {
  constructor(
    private followRepository: FollowRepository,
    private userRepository: UserRepository,
    private blogRepository: BlogRepository,
  ) {}

  public followUser = async (followerId: string, followingId: string) => {
    if (followingId === followerId) {
      throw ApiError.badRequest("You cannot follow yourself");
    }

    const userToFollow = await this.userRepository.findById(followingId);
    if (!userToFollow || userToFollow.isDeleted) {
      throw ApiError.notFound("User not found");
    }

    const result = await this.followRepository.create(followerId, followingId);
    if (!result) {
      throw ApiError.badRequest("Failed to follow user");
    }

    return ApiSuccess.ok("User followed successfully", { following: true });
  };

  public unfollowUser = async (followerId: string, followingId: string) => {
    if (followingId === followerId) {
      throw ApiError.badRequest("You cannot unfollow yourself");
    }

    const result = await this.followRepository.deleteByFollowerIdAndFollowingId(
      followerId,
      followingId,
    );
    if (!result) {
      throw ApiError.badRequest("Failed to unfollow user");
    }

    return ApiSuccess.ok("User unfollowed successfully", { following: false });
  };

  public findFollowing = async (userId: string, query: FollowListQueryDto) => {
    const result = await this.followRepository.findFollowingByUserId(
      userId,
      query,
    );

    return ApiSuccess.ok("Following retrieved successfully", result);
  };

  public findFollowers = async (userId: string, query: FollowListQueryDto) => {
    const result = await this.followRepository.findFollowersByUserId(
      userId,
      query,
    );

    return ApiSuccess.ok("Followers retrieved successfully", result);
  };

  public findFollowingFeed = async (
    userId: string,
    query: FollowListQueryDto,
  ) => {
    const followingIds =
      await this.followRepository.findFollowingIdsByUserId(userId);

    if (followingIds.length === 0) {
      return ApiSuccess.ok("Feed retrieved successfully", {
        items: [],
        pagination: {
          total: 0,
          page: query.page,
          limit: query.limit,
          totalPages: 0,
        },
      });
    }

    const result = await this.blogRepository.findAll({
      page: query.page,
      limit: query.limit,
      search: query.search,
      authorIds: followingIds,
      isPublished: true,
    });

    return ApiSuccess.ok("Feed retrieved successfully", result);
  };
}

export const followService = new FollowService(
  followRepository,
  userRepository,
  blogRepository,
);
