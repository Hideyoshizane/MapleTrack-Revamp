import 'server-only';

import { z } from 'zod';

import { sanitizeInputBackEnd } from '@utils/sanitizeInputBackEnd';

import { characterNameRawSchema } from './character.raw.schema';
import { serverSchema } from './characterRequestSchema';

export const characterServerSideSchema = z.object({
	name: characterNameRawSchema.transform(sanitizeInputBackEnd),
});

export const characterApiSchema = z.object({
	characterName: characterNameRawSchema,
	server: serverSchema,
});
