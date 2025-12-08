import mongoose, { Schema } from 'mongoose';

import type { Document, Model } from 'mongoose';

export interface Boss {
	name: string;
	difficulty: string;
	reset: 'Daily' | 'Weekly' | 'Monthly';
	cleared: boolean;
	DailyTotal?: number;
	date?: Date;
	locked?: boolean;
}

export interface BossCharacter {
	name: string;
	code: string;
	class: string;
	level: number;
	totalIncome?: number;
	bosses: Boss[];
}

export interface BossServer {
	name: string;
	weeklyBosses: number;
	totalGains: number;
	characters: BossCharacter[];
}

export interface BossListDocument extends Document {
	userOrigin: string;
	lastUpdate: Date | null;
	server: BossServer[];
}

const BossSchema = new Schema<Boss>(
	{
		name: { type: String, required: true },
		difficulty: { type: String, required: true },
		reset: { type: String, enum: ['Daily', 'Weekly', 'Monthly'], required: true },
		DailyTotal: { type: Number, default: 0 },
		date: { type: Date, default: null },
		cleared: { type: Boolean, default: false },
		locked: { type: Boolean, default: false },
	},
	{ _id: false, versionKey: false }
);

const BossCharacterSchema = new Schema<BossCharacter>(
	{
		name: { type: String, required: true },
		code: { type: String, required: true },
		class: { type: String, required: true },
		level: { type: Number, required: true },
		totalIncome: { type: Number, default: 0 },
		bosses: { type: [BossSchema], default: [] },
	},
	{ _id: false, versionKey: false }
);

const BossServerSchema = new Schema<BossServer>(
	{
		name: { type: String, required: true },
		weeklyBosses: { type: Number, default: 0 },
		totalGains: { type: Number, default: 0 },
		characters: { type: [BossCharacterSchema], default: [] },
	},
	{ _id: false, versionKey: false }
);

const BossListSchema = new Schema<BossListDocument>(
	{
		userOrigin: { type: String, required: true },
		lastUpdate: { type: Date, default: null },
		server: { type: [BossServerSchema], default: [] },
	},
	{ versionKey: false }
);

BossListSchema.index({ userOrigin: 1 });

// Prevent model overwrite on hot reload (Next.js)
export const BossList: Model<BossListDocument> =
	(mongoose.models.BossList as Model<BossListDocument>) || mongoose.model<BossListDocument>('BossList', BossListSchema);
