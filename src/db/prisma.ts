import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../../generated/prisma/client";
import { env } from "../config/env.config";
import { logger } from "../middleware/logger.middleware";

const adapter = new PrismaPg({
  connectionString: env.DATABASE_URL,
});

const prisma = new PrismaClient({
  adapter,
});

export async function dbHealthcheck() {
  await prisma.$queryRaw`SELECT 1`;
  logger.info("Database is healthy");
}

export { prisma };
