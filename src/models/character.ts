import mongoose, { Schema } from 'mongoose';

import type { SymbolCategory } from '@data/symbols/symbolMappings';
import type { Document, Model } from 'mongoose';

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
	},
	{ _id: false, versionKey: false }
);

const SymbolSchema = new Schema<CharacterSymbol>(
	{
		name: { type: String, required: true },
		level: { type: Number, required: true },
		exp: { type: Number, required: true },
		content: { type: [CharacterContentSchema], default: [] },
		category: { type: String, required: true },
	},
	{ _id: false, versionKey: false }
);

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
