import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IMatch extends Document {
    season: Types.ObjectId;
    channelId: string;
    messageId: string;
    disputeThreadId: string;
    winnerUserId: string;
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
    createdAt: { type: Date, default: Date.now },
    confirmedAt: Date,
});

export const Match = mongoose.model('Match', matchSchema);
