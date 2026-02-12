import { z } from 'zod';

import { characterNameRawSchema } from './character.raw.schema';
import { serverSchema } from './characterRequestSchema';

export const characterClientSchema = z.object({
	name: characterNameRawSchema,
});

export const characterApiSchema = z.object({
	characterName: characterNameRawSchema,
	server: serverSchema,
});
