/*import "dotenv/config";
import { PrismaClient } from '../../generated/prisma/client.ts';
// import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
/*
const connectionString = `${process.env.DATABASE_URL}`
const adapter = new PrismaBetterSqlite3({ url : connectionString })
const prisma = new PrismaClient({ adapter });

const prisma = new PrismaClient()
export default prisma; */

import "dotenv/config";
import { PrismaClient } from '../../generated/prisma/client.ts'; 
import { PrismaPg } from '@prisma/adapter-pg';
import pg from "pg"
// Initialize the native PG pool
const pool = new pg.Pool({ 
  connectionString: process.env.DATABASE_URL 
});

// Wrap it with the Prisma 7 PostgreSQL adapter
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

export default prisma;
