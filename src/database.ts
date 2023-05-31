import mongoose, { Schema } from 'mongoose';
import { DATABASE_URI, MIGRATION_DATABASE } from './env';

export const connection = mongoose.createConnection(DATABASE_URI);
export const migrationConnection = connection.useDb(MIGRATION_DATABASE);

const schema = new Schema({}, { strict: false });

export const OldConfig = migrationConnection.model('Config', schema.clone());
export const OldAlias = migrationConnection.model('Aliases', schema.clone());
export const OldDeck = migrationConnection.model('Decks', schema.clone());
export const OldMatch = migrationConnection.model('Matches', schema.clone());
export const OldSeason = migrationConnection.model('Seasons', schema.clone());
export const OldUser = migrationConnection.model('Users', schema.clone());
