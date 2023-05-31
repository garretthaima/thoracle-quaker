import { Document, Schema } from 'mongoose';
import { connection } from '../database';

export interface IDeck extends Document {
    guildId: string;
    userId: string;
    name: string;
    deckList?: string;
}

const deckSchema = new Schema({
    guildId: { type: String, required: true },
    userId: { type: String, required: true },
    name: { type: String, required: true },
    deckList: String,
});

export const Deck = connection.model('Deck', deckSchema);
