import mongoose, { Schema } from 'mongoose';

import type { Document, Model, Types } from 'mongoose';

const LASTVERSION = 1;

export interface IUser extends Document {
	_id: Types.ObjectId;
	username: string; // Username of the user (must be unique)
	email: string; // Email address (must be unique)
	password: string; // Hashed password
	version?: number; // Maybe will be deleted
	lastLogin: Date; // Last time user Logged in
	characters: mongoose.Types.ObjectId[]; // characters stored ID
	resetPasswordToken?: string; //  Token for password reset
	resetPasswordExpires?: Date; // Expiration date for the reset token
}

const userSchema = new Schema<IUser>(
	{
		username: {
			type: String,
			required: true,
			minlength: 3,
			maxlength: 16,
			unique: true,
			trim: true,
		},
		email: {
			type: String,
			required: true,
			maxlength: 100,
			unique: true,
			lowercase: true,
			trim: true,
		},
		password: {
			type: String,
			required: true,
			minlength: 8,
			maxlength: 72,
		},
		version: {
			type: Number,
			default: LASTVERSION,
			required: true,
		},
		lastLogin: {
			type: Date,
			default: (): Date => new Date(),
		},
		characters: [
			{
				type: Schema.Types.ObjectId,
				ref: 'Character',
				versionKey: false,
			},
		],
		resetPasswordToken: {
			type: String,
		},
		resetPasswordExpires: {
			type: Date,
		},
	},
	{
		versionKey: false,
	}
);

// Indexes
userSchema.index({ resetPasswordToken: 1, resetPasswordExpires: 1 });

// Create the User model if it doesn't already exist (to avoid model overwrite in dev)
const User: Model<IUser> = (mongoose.models.User as Model<IUser>) || mongoose.model<IUser>('User', userSchema);

export default User;
export { LASTVERSION };
