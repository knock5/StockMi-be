import { PrismaClient } from "@prisma/client";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import dotenv from "dotenv";
import { env } from "prisma/config";

dotenv.config();

const adapter = new PrismaMariaDb({
  host: env("DB_HOST"),
  port: env("DB_PORT"),
  user: env("DB_USER"),
  password: env("DB_PASSWORD"),
  database: env("DB_NAME"),
});

const prisma = new PrismaClient({
  adapter,
});

export { prisma };
