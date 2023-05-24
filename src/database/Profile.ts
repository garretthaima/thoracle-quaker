import mongoose, { Document, Schema, Types, UpdateQuery } from 'mongoose';

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

export async function fetchProfile(
    guildId: string,
    userId: string,
    query: UpdateQuery<IProfile> = {}
): Promise<IProfile> {
    return await Profile.findOneAndUpdate({ _id: userId, guildId }, query, {
        new: true,
        upsert: true,
    });
}
