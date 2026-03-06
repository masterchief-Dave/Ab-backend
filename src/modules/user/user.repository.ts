import { Prisma, PrismaClient } from "../../../generated/prisma/client";
import { prisma } from "../../db/prisma";

export class UserRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findByEmail(email: string) {
    return await this.prisma.user.findUnique({
      where: {
        email,
      },
    });
  }

  async findById(id: string) {
    return await this.prisma.user.findUnique({
      where: { id },
    });
  }

  async create(args: { userData: Prisma.UserCreateInput }) {
    return await this.prisma.user.create({
      data: args.userData,
    });
  }
}

export const userRepository = new UserRepository(prisma);
