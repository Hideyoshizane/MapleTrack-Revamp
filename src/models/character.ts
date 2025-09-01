import mongoose, { Schema, Document, Model } from 'mongoose';

export interface CharacterContent {
	contentType: string;
	checked: boolean;
	date?: Date | null;
	tries?: number;
	maxTries?: number;
}

export interface Symbol {
	name: string;
	level: number;
	exp: number;
	content: CharacterContent[];
}

export interface CharacterDocument extends Document {
	name: string;
	level: number;
	targetLevel: number;
	class?: string;
	code?: string;
	jobType?: string;
	legion?: string;
	linkSkill?: string;
	bossing: boolean;
	syncing: boolean;
	server?: string;
	userOrigin?: string;
	lastUpdate?: Date;
	ArcaneSymbol: Symbol[];
	SacredSymbol: Symbol[];
	GrandSacredSymbol: Symbol[];
}

const CharacterSchema = new Schema<CharacterDocument>(
	{
		name: { type: String, required: true },
		level: { type: Number, required: true },
		targetLevel: { type: Number, required: true },
		class: String,
		code: String,
		jobType: String,
		legion: String,
		linkSkill: String,
		bossing: { type: Boolean, default: false },
		syncing: { type: Boolean, default: false },
		server: String,
		userOrigin: String,
		lastUpdate: Date,
		ArcaneSymbol: [
			{
				name: { type: String, required: true },
				level: { type: Number, required: true },
				exp: { type: Number, required: true },
				content: [
					{
						contentType: { type: String, required: true },
						checked: Boolean,
						date: Date,
						tries: Number,
						maxTries: Number,
					},
				],
			},
		],
		SacredSymbol: [
			{
				name: { type: String, required: true },
				level: { type: Number, required: true },
				exp: { type: Number, required: true },
				content: [
					{
						contentType: { type: String, required: true },
						checked: Boolean,
						date: Date,
					},
				],
			},
		],
		GrandSacredSymbol: [
			{
				name: { type: String, required: true },
				level: { type: Number, required: true },
				exp: { type: Number, required: true },
				content: [
					{
						contentType: { type: String, required: true },
						checked: Boolean,
						date: Date,
					},
				],
			},
		],
	},
	{ timestamps: true }
);

// Avoid model overwrite error in Next.js hot reload
export const Character: Model<CharacterDocument> =
	(mongoose.models.Character as Model<CharacterDocument>) ||
	mongoose.model<CharacterDocument>('Character', CharacterSchema);
