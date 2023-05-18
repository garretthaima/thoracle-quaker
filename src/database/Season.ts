import mongoose, { Document, Schema } from 'mongoose';

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

export const Season = mongoose.model('Season', seasonSchema);
