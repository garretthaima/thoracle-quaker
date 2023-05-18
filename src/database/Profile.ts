import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IProfile extends Document {
    currentDeck?: Types.ObjectId;
    createdAt: Date;
}

const profileSchema = new Schema({
    _id: String,
    currentDeck: { type: Schema.Types.ObjectId, ref: 'Deck' },
    createdAt: { type: Date, default: Date.now },
});

export const Profile = mongoose.model('Profile', profileSchema);
