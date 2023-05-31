import { Document, Schema, Types, UpdateQuery } from 'mongoose';
import { connection } from '../database';

export interface IProfile extends Document {
    guildId: string;
    userId: string;
    currentDeck?: Types.ObjectId;
}

const profileSchema = new Schema({
    guildId: { type: String, required: true },
    userId: { type: String, required: true },
    currentDeck: { type: Schema.Types.ObjectId, ref: 'Deck' },
});

export const Profile = connection.model('Profile', profileSchema);

export async function fetchProfile(
    guildId: string,
    userId: string,
    query: UpdateQuery<IProfile> = {}
): Promise<IProfile> {
    return await Profile.findOneAndUpdate({ guildId, userId }, query, {
        new: true,
        upsert: true,
    });
}
