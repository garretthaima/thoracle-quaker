import mongoose, { Document, Schema } from 'mongoose';

export interface IDeck extends Document {
    userId: string;
    name: string;
    deckList?: string;
    createdAt: Date;
}

const deckSchema = new Schema({
    userId: { type: String, required: true },
    name: { type: String, required: true },
    deckList: String,
    createdAt: { type: Date, default: Date.now },
});

export const Deck = mongoose.model('Deck', deckSchema);
