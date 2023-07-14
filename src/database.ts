import mongoose from 'mongoose';
import { DATABASE_URI } from './env';

export const connection = mongoose.createConnection(DATABASE_URI);
