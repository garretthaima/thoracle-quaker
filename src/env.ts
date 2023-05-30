import dotenv from 'dotenv';

// Read environment variables
dotenv.config();

export const DATABASE = process.env.DATABASE!;
if (!DATABASE) throw new Error('Missing `DATABASE` environment variable.');

export const MIGRATION_DATABASE = process.env.MIGRATION_DATABASE!;
if (!MIGRATION_DATABASE)
    throw new Error('Missing `MIGRATION_DATABASE` environment variable.');

export const TOKEN = process.env.TOKEN!;
if (!TOKEN) throw new Error('Missing `TOKEN` environment variable.');

export const CLIENT_ID = process.env.CLIENT_ID!;
if (!CLIENT_ID) throw new Error('Missing `CLIENT_ID` environment variable.');

export const GUILD_ID = process.env.GUILD_ID!;
if (!GUILD_ID) throw new Error('Missing `GUILD_ID` environment variable.');
