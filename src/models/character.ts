import mongoose, { Schema, Document, Model } from 'mongoose';
import { SymbolCategory, CATEGORY_MAX_LEVEL } from '@data/symbols/symbolMappings';

export const DEFAULT_WEEKLY_TRIES = 3;
export const CHARACTER_MAX_LEVEL = 300;

export interface CharacterContent {
	contentType: string;
	checked: boolean;
	date?: Date | null;
	tries?: number;
	maxTries?: number;
}

export interface CharacterSymbol {
	name: string;
	level: number;
	exp: number;
	content: CharacterContent[];
	category: SymbolCategory;
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
	ArcaneSymbol: CharacterSymbol[];
	SacredSymbol: CharacterSymbol[];
	GrandSacredSymbol: CharacterSymbol[];
}

const CharacterContentSchema = new Schema<CharacterContent>(
	{
		contentType: { type: String, required: true },
		checked: { type: Boolean, default: false },
		date: { type: Date, default: null },
		tries: { type: Number, min: 0 },
		maxTries: { type: Number, min: 0 },
	},
	{ _id: false, versionKey: false }
);

const SymbolSchema = new Schema<CharacterSymbol>(
	{
		name: { type: String, required: true },
		level: {
			type: Number,
			required: true,
			min: 1,
			validate: {
				validator: function (value: number) {
					// `this` refers to the current document
					const category = (this as CharacterSymbol).category;
					return value <= CATEGORY_MAX_LEVEL[category];
				},
				message: (props) => `Level ${props.value} exceeds max level for category.`,
			},
		},
		exp: { type: Number, required: true, min: 0 },
		content: { type: [CharacterContentSchema], default: [] },
	},
	{ _id: false, versionKey: false }
);

const CharacterSchema = new Schema<CharacterDocument>(
	{
		name: { type: String, required: true },
		level: { type: Number, required: true, min: 0, max: CHARACTER_MAX_LEVEL },
		targetLevel: { type: Number, required: true, min: 0, max: CHARACTER_MAX_LEVEL },
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
		ArcaneSymbol: { type: [SymbolSchema], default: [] },
		SacredSymbol: { type: [SymbolSchema], default: [] },
		GrandSacredSymbol: { type: [SymbolSchema], default: [] },
	},
	{ versionKey: false }
);

CharacterSchema.index({ name: 1, userOrigin: 1 });
CharacterSchema.index({ server: 1 });

// Avoid model overwrite error in Next.js hot reload
export const Character: Model<CharacterDocument> =
	(mongoose.models.Character as Model<CharacterDocument>) ||
	mongoose.model<CharacterDocument>('Character', CharacterSchema);
