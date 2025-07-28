import mongoose, { Document, Model, Schema, Types } from 'mongoose';

const LASTVERSION = 3;

export interface IUser extends Document {
	_id: Types.ObjectId;
	username: string; // Username of the user (must be unique)
	email: string; // Email address (must be unique)
	password: string; // Hashed password
	version?: number; // Maybe will be deleted
	lastLogin: Date; // Last time user Logged in
	servers: mongoose.Types.ObjectId[]; // Maybe will be deleted
	resetPasswordToken?: string; //  Token for password reset
	resetPasswordExpires?: Date; // Expiration date for the reset token
}

const userSchema = new Schema<IUser>({
	username: {
		type: String,
		required: true,
		minlength: 3,
		maxlength: 32,
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
	},
	lastLogin: {
		type: Date,
	},
	servers: [
		{
			type: Schema.Types.ObjectId,
			ref: 'Server',
		},
	],
	resetPasswordToken: {
		type: String,
	},
	resetPasswordExpires: {
		type: Date,
	},
});
// Create the User model if it doesn't already exist (to avoid model overwrite in dev)
const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>('User', userSchema);

export default User;
export { LASTVERSION };
