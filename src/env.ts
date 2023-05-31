import dotenv from 'dotenv';

// Read environment variables
dotenv.config();

export const TOKEN = process.env.TOKEN!;
if (!TOKEN) throw new Error('Missing `TOKEN` environment variable.');

export const CLIENT_ID = process.env.CLIENT_ID!;
if (!CLIENT_ID) throw new Error('Missing `CLIENT_ID` environment variable.');

export const GUILD_ID = process.env.GUILD_ID!;
if (!GUILD_ID) throw new Error('Missing `GUILD_ID` environment variable.');

export const ADMIN_USER_IDS =
    process.env.ADMIN_USER_IDS?.trim().split(/,|\s+/)!;
if (!ADMIN_USER_IDS)
    throw new Error('Missing `ADMIN_USER_IDS` environment variable.');

export const DATABASE_URI = process.env.DATABASE_URI!;
if (!DATABASE_URI)
    throw new Error('Missing `DATABASE_URI` environment variable.');

export const MIGRATION_DATABASE = process.env.MIGRATION_DATABASE!;
if (!MIGRATION_DATABASE)
    throw new Error('Missing `MIGRATION_DATABASE` environment variable.');
