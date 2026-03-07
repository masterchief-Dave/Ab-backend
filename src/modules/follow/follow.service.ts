import { ApiError, ApiSuccess } from "../../utils/api-response.utils";
import { followRepository, type FollowRepository } from "./follow.repository";
import { userRepository, type UserRepository } from "../user/user.repository";
import { blogRepository, type BlogRepository } from "../blog/blog.repository";

export class FollowService {
  constructor(
    private followRepository: FollowRepository,
    private userRepository: UserRepository,
    private blogRepository: BlogRepository,
  ) {}

  public toggleFollowUser = async (followerId: string, followingId: string) => {
    if (followerId === followingId) {
      throw ApiError.badRequest("You cannot follow yourself");
    }

    const userToFollow = await this.userRepository.findById(followingId);
    if (!userToFollow || userToFollow.isDeleted) {
      throw ApiError.notFound("User not found");
    }

    const existingFollow =
      await this.followRepository.findByFollowerIdAndFollowingId(
        followerId,
        followingId,
      );

    if (existingFollow) {
      await this.followRepository.deleteByFollowerIdAndFollowingId(
        followerId,
        followingId,
      );

      return ApiSuccess.ok("User unfollowed successfully", {
        following: false,
      });
    }

    await this.followRepository.create(followerId, followingId);

    return ApiSuccess.ok("User followed successfully", {
      following: true,
    });
  };

  public getFollowing = async (userId: string, query: GetUserBlogsQueryDto) => {
    const page = query.page;
    const limit = query.limit;
    const skip = (page - 1) * limit;

    const [following, totalCount] = await Promise.all([
      this.followRepository.findFollowingByUserId({
        userId,
        skip,
        take: limit,
      }),
      this.followRepository.countFollowingByUserId(userId),
    ]);

    return ApiSuccess.ok("Following retrieved successfully", {
      following,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
      },
    });
  };

  public getFollowers = async (userId: string, query: GetUserBlogsQueryDto) => {
    const page = query.page;
    const limit = query.limit;
    const skip = (page - 1) * limit;

    const [followers, totalCount] = await Promise.all([
      this.followRepository.findFollowersByUserId({
        userId,
        skip,
        take: limit,
      }),
      this.followRepository.countFollowersByUserId(userId),
    ]);

    return ApiSuccess.ok("Followers retrieved successfully", {
      followers,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
      },
    });
  };

  public getFollowingFeed = async (
    userId: string,
    query: GetUserBlogsQueryDto,
  ) => {
    const followingIds =
      await this.followRepository.findFollowingIdsByUserId(userId);

    const page = query.page;
    const limit = query.limit;
    const skip = (page - 1) * limit;

    if (followingIds.length === 0) {
      return ApiSuccess.ok("Feed retrieved successfully", {
        blogs: [],
        pagination: {
          page,
          limit,
          totalCount: 0,
          totalPages: 0,
        },
      });
    }

    const [blogs, totalCount] = await Promise.all([
      this.blogRepository.findFeedPosts({
        followingIds,
        skip,
        take: limit,
      }),
      this.blogRepository.countFeedPosts(followingIds),
    ]);

    return ApiSuccess.ok("Feed retrieved successfully", {
      blogs,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
      },
    });
  };
}

export const followService = new FollowService(
  followRepository,
  userRepository,
  blogRepository,
);
