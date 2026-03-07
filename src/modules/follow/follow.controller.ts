import type { Request, Response } from "express";
import { followService, type FollowService } from "./follow.service";
import type { AuthenticatedUser } from "../auth/auth.interface";
import type { FollowListQueryDto } from "./follow.schema";

export class FollowController {
  constructor(private followService: FollowService) {}

  public followUser = async (req: Request, res: Response) => {
    const user = req.user as AuthenticatedUser;
    const followingId = req.params.followingId as string;
    const result = await this.followService.followUser(user.id, followingId);
    res.status(result.status_code).json(result);
  };

  public unFollowUser = async (req: Request, res: Response) => {
    const user = req.user as AuthenticatedUser;
    const followingId = req.params.followingId as string;
    const result = await this.followService.unfollowUser(user.id, followingId);
    res.status(result.status_code).json(result);
  };

  public getFollowing = async (req: Request, res: Response) => {
    const user = req.user as AuthenticatedUser;
    const query = req.query as unknown as FollowListQueryDto;
    const result = await this.followService.findFollowing(user.id, query);
    res.status(result.status_code).json(result);
  };

  public getFollowers = async (req: Request, res: Response) => {
    const user = req.user as AuthenticatedUser;
    const query = req.query as unknown as FollowListQueryDto;
    const result = await this.followService.findFollowers(user.id, query);
    res.status(result.status_code).json(result);
  };

  public getFollowingFeed = async (req: Request, res: Response) => {
    const user = req.user as AuthenticatedUser;
    const query = req.query as unknown as FollowListQueryDto;
    const result = await this.followService.findFollowingFeed(user.id, query);
    res.status(result.status_code).json(result);
  };
}

export const followController = new FollowController(followService);
