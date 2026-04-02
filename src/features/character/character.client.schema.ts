import z from 'zod';

import { characterNameRawSchema } from './character.raw.schema';

export const characterClientSchema = z.object({
	characterName: characterNameRawSchema,
});
