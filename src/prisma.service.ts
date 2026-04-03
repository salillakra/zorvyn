import 'dotenv/config';
import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { PrismaClient } from '../generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error('DATABASE_URL is required');
}

const globalForPrisma = globalThis as unknown as {
  prismaClient?: PrismaClient;
};

function parsePositiveInt(value: string | undefined, fallback: number): number {
  if (!value) {
    return fallback;
  }

  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
}

const poolMax = parsePositiveInt(process.env.PRISMA_POOL_MAX, 3);
const connectionTimeoutMillis = parsePositiveInt(
  process.env.PRISMA_POOL_CONNECTION_TIMEOUT_MS,
  60_000,
);
const idleTimeoutMillis = parsePositiveInt(
  process.env.PRISMA_POOL_IDLE_TIMEOUT_MS,
  30_000,
);

export const prismaClient =
  globalForPrisma.prismaClient ??
  new PrismaClient({
    adapter: new PrismaPg({
      connectionString: databaseUrl,
      max: poolMax,
      connectionTimeoutMillis,
      idleTimeoutMillis,
    }),
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prismaClient = prismaClient;
}

@Injectable()
export class PrismaService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);

  constructor(private readonly prisma: PrismaClient) {}

  async onModuleInit(): Promise<void> {
    await this.prisma.$connect();
    this.logger.log('Connected to the database');
  }

  async onModuleDestroy(): Promise<void> {
    await this.prisma.$disconnect();
  }
}
