import mongoose from 'mongoose';
import { DATABASE, MIGRATION_DATABASE } from './env';

export const connection = mongoose.createConnection(DATABASE);
export const migrationConnection = connection.useDb(MIGRATION_DATABASE);
