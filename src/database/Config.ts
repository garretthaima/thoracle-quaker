import mongoose, { Document, Schema } from 'mongoose';

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

export const Config = mongoose.model('Config', configSchema);
