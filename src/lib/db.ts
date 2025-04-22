// lib/prisma.ts
import { PrismaClient } from "@prisma/client";
import mysql from 'mysql2/promise';

const globalForPrisma = global as unknown as { prisma: PrismaClient };

const prisma = globalForPrisma.prisma || new PrismaClient();

export default prisma;

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export const db = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'xuchil',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});