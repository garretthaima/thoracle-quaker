import mongoose, { Document, Schema, UpdateQuery } from 'mongoose';

export interface IConfig extends Document {
    minimumGamesPerPlayer: number;
    pointsGained: number;
    pointsLost: number;
    basePoints: number;
    deckLimit: number;
    disputeRoleId?: string;
}

const configSchema = new Schema({
    minimumGamesPerPlayer: { type: Number, default: 10 },
    pointsGained: { type: Number, default: 1 },
    pointsLost: { type: Number, default: 0 },
    basePoints: { type: Number, default: 100 },
    deckLimit: { type: Number, default: 50 },
    disputeRoleId: String,
});

export const Config = mongoose.model('Config', configSchema);

export async function fetchConfig(
    query: UpdateQuery<IConfig> = {}
): Promise<IConfig> {
    return await Config.findOneAndUpdate({}, query, {
        new: true,
        upsert: true,
    });
}
