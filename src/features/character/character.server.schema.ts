import 'server-only';

import { z } from 'zod';

import { sanitizeInputBackEnd } from '@utils/sanitizeInputBackEnd';

import { characterNameRawSchema } from './character.raw.schema';

export const characterServerSideSchema = z.object({
	name: characterNameRawSchema.transform(sanitizeInputBackEnd),
});
