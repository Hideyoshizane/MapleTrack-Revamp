import mongoose, { Document, Model, Schema } from 'mongoose';

const LASTVERSION = 3;

export interface IUser extends Document {
	username: string;
	email: string;
	password: string;
	version?: number;
	date?: Date;
	servers: mongoose.Types.ObjectId[];
	resetPasswordToken?: string;
	resetPasswordExpires?: Date;
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
	date: {
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

const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>('User', userSchema);

export default User;
export { LASTVERSION };
