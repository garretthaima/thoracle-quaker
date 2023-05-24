import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IProfile extends Document {
    guildId: string;
    currentDeck?: Types.ObjectId;
    createdAt: Date;
}

const profileSchema = new Schema({
    _id: String,
    guildId: { type: String, required: true },
    currentDeck: { type: Schema.Types.ObjectId, ref: 'Deck' },
    createdAt: { type: Date, default: Date.now },
});

export const Profile = mongoose.model('Profile', profileSchema);
