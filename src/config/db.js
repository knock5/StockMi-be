import { PrismaClient } from "@prisma/client";
import dotenv from "dotenv";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import { env } from "prisma/config";

dotenv.config();

// Ensure DATABASE_URL is set for Prisma internals as well
process.env.DATABASE_URL = env("DB_URL");

// Create MariaDB adapter with options to allow public key retrieval
// which addresses RSA public key errors with newer MySQL servers.
const adapter = new PrismaMariaDb({
  host: env("DB_HOST"),
  port: Number(env("DB_PORT")),
  user: env("DB_USER"),
  password: env("DB_PASSWORD"),
  database: env("DB_NAME"),
  allowPublicKeyRetrieval: true,
  ssl: false,
});

const prisma = new PrismaClient({
  adapter,
});

export { prisma };
