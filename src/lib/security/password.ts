import { argon2, randomBytes, timingSafeEqual } from 'node:crypto';

const PEPPER = process.env.ARGON2_PEPPER;
if (!PEPPER) {
	throw new Error('CRITICAL: ARGON2_PEPPER environment variable is not set.');
}

type StoredPasswordHash = {
	salt: string;
	hash: string;
	memory: number;
	passes: number;
	parallelism: number;
	tagLength: number;
};

const DEFAULT_CONFIG = {
	memory: 192 * 1024,
	passes: 3,
	parallelism: 4,
	tagLength: 32,
};

export const DUMMY_HASH = JSON.stringify({
	salt: 'w6hQhJt7ZV0Vx8p2W0Q3nQ==',
	hash: 'l6dH0l...',
	memory: 192 * 1024,
	passes: 3,
	parallelism: 4,
	tagLength: 32,
});

const runArgon2 = (params: { password: string; salt: Buffer; config: typeof DEFAULT_CONFIG }): Promise<Buffer> => {
	return new Promise((resolve, reject) => {
		argon2(
			'argon2id',
			{
				message: params.password,
				nonce: params.salt,
				secret: Buffer.from(PEPPER, 'utf8'),
				parallelism: params.config.parallelism,
				tagLength: params.config.tagLength,
				memory: params.config.memory,
				passes: params.config.passes,
			},
			(err, derivedKey) => {
				if (err) {
					reject(err);

					return;
				}
				resolve(Buffer.from(derivedKey));
			},
		);
	});
};

export const hashPassword = async (plainPassword: string): Promise<string> => {
	const salt = randomBytes(16);

	const derivedKey = await runArgon2({ password: plainPassword, salt, config: DEFAULT_CONFIG });

	const payload: StoredPasswordHash = {
		salt: salt.toString('base64'),
		hash: derivedKey.toString('base64'),
		...DEFAULT_CONFIG,
	};

	return JSON.stringify(payload);
};

export const verifyPassword = async (stored: string, plainPassword: string): Promise<boolean> => {
	try {
		const parsed = JSON.parse(stored) as StoredPasswordHash;

		const derivedKey = await runArgon2({
			password: plainPassword,
			salt: Buffer.from(parsed.salt, 'base64'),
			config: {
				memory: parsed.memory,
				passes: parsed.passes,
				parallelism: parsed.parallelism,
				tagLength: parsed.tagLength,
			},
		});

		const storedKey = Buffer.from(parsed.hash, 'base64');

		if (storedKey.length !== derivedKey.length) {
			return false;
		}

		return timingSafeEqual(storedKey, derivedKey);
	} catch {
		return false;
	}
};
