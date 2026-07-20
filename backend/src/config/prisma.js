/*import "dotenv/config";
import { PrismaClient } from '../../generated/prisma/client.ts';
// import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
/*
const connectionString = `${process.env.DATABASE_URL}`
const adapter = new PrismaBetterSqlite3({ url : connectionString })
const prisma = new PrismaClient({ adapter });

const prisma = new PrismaClient()
export default prisma; */
import "dotenv/config"
import pg from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../../generated/prisma/client.ts';

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  connectionTimeoutMillis: 10000, // Extend wait time to 10s before timing out
  idleTimeoutMillis: 30000,       // Keep idle connections open for 30s
  max: 20                         // Ensure your pool size matches your needs
});

const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });
export default prisma