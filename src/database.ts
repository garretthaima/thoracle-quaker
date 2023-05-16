import mongoose, { Schema } from 'mongoose';
import { DATABASE } from './env';

mongoose.connect(DATABASE);

const configSchema = new Schema({
    minimumGamesPerPlayer: { type: Number, default: 10 },
    pointsGained: { type: Number, default: 1 },
    pointsLost: { type: Number, default: 0 },
});

const seasonSchema = new Schema({
    name: { type: String, required: true },
    startDate: { type: Date, default: Date.now },
    endDate: Date,
});

const deckSchema = new Schema({
    player: { type: String, required: true },
    name: { type: String, required: true },
    deckList: { type: String, required: true },
});

const profileSchema = new Schema({
    _id: String,
    currentDeck: { type: Schema.Types.ObjectId, ref: 'Deck' },
});

const matchSchema = new Schema({
    season: { type: Schema.Types.ObjectId, ref: 'Season', required: true },
    winner: { type: String, required: true },
    players: [
        {
            player: { type: String, required: true },
            deck: { type: Schema.Types.ObjectId, ref: 'Deck' },
        },
    ],
});

export const Config = mongoose.model('Config', configSchema);
export const Season = mongoose.model('Season', seasonSchema);
export const Deck = mongoose.model('Deck', deckSchema);
export const Profile = mongoose.model('Profile', profileSchema);
export const Match = mongoose.model('Match', matchSchema);
