import mongoose, { Document, Schema, Types } from 'mongoose';
import { DATABASE } from './env';

mongoose.connect(DATABASE);

// Config
export interface IConfig extends Document {
    minimumGamesPerPlayer: number;
    pointsGained: number;
    pointsLost: number;
    basePoints: number;
}

const configSchema = new Schema({
    minimumGamesPerPlayer: { type: Number, default: 10 },
    pointsGained: { type: Number, default: 1 },
    pointsLost: { type: Number, default: 0 },
    basePoints: { type: Number, default: 100 },
});

// Season
export interface ISeason extends Document {
    name: string;
    startDate: Date;
    endDate?: Date;
}

const seasonSchema = new Schema({
    name: { type: String, required: true },
    startDate: { type: Date, default: Date.now },
    endDate: Date,
});

// Deck
export interface IDeck extends Document {
    userId: string;
    name: string;
    deckList: string;
}

const deckSchema = new Schema({
    userId: { type: String, required: true },
    name: { type: String, required: true },
    deckList: { type: String, required: true },
});

// Profile
export interface IProfile extends Document {
    currentDeck?: Types.ObjectId;
}

const profileSchema = new Schema({
    _id: String,
    currentDeck: { type: Schema.Types.ObjectId, ref: 'Deck' },
});

// Match
export interface IMatch extends Document {
    season: Types.ObjectId;
    channelId: string;
    messageId: string;
    disputeThreadId: string;
    winnerUserId: string;
    players: IMatchPlayer[];
}

export interface IMatchPlayer {
    userId: string;
    deck?: Types.ObjectId;
    confirmed: boolean;
}

const matchSchema = new Schema({
    season: { type: Schema.Types.ObjectId, ref: 'Season', required: true },
    channelId: { type: String, required: true },
    messageId: { type: String, required: true },
    disputeThreadId: String,
    winnerUserId: { type: String, required: true },
    players: [
        {
            userId: { type: String, required: true },
            deck: { type: Schema.Types.ObjectId, ref: 'Deck' },
            confirmed: { type: Boolean, default: false },
        },
    ],
});

// Models
export const Config = mongoose.model('Config', configSchema);
export const Season = mongoose.model('Season', seasonSchema);
export const Deck = mongoose.model('Deck', deckSchema);
export const Profile = mongoose.model('Profile', profileSchema);
export const Match = mongoose.model('Match', matchSchema);
