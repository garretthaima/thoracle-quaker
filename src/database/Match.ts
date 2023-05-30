import { Document, Schema, Types } from 'mongoose';
import { connection } from '../database';

export interface IMatch extends Document {
    guildId: string;
    channelId: string;
    messageId: string;
    winnerUserId: string;
    disputeThreadId?: string;
    season: Types.ObjectId;
    players: IMatchPlayer[];
    createdAt: Date;
    confirmedAt?: Date;
}

export interface IMatchPlayer {
    userId: string;
    deck?: Types.ObjectId;
    confirmed: boolean;
}

const matchSchema = new Schema({
    guildId: { type: String, required: true },
    channelId: { type: String, required: true },
    messageId: { type: String, required: true },
    winnerUserId: { type: String, required: true },
    disputeThreadId: String,
    season: { type: Schema.Types.ObjectId, ref: 'Season', required: true },
    players: [
        {
            userId: { type: String, required: true },
            deck: { type: Schema.Types.ObjectId, ref: 'Deck' },
            confirmed: { type: Boolean, default: false },
        },
    ],
    createdAt: { type: Date, default: Date.now },
    confirmedAt: Date,
});

export const Match = connection.model('Match', matchSchema);
