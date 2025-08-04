import bcrypt from 'bcrypt';
import { NextRequest } from 'next/server';

import { SignupRequestBody } from '@/shared/types/api/auth';
import connectToDatabase from '@lib/mongooseConect';
import User, { LASTVERSION } from '@models/user';
import { createResponse } from '@utils/api/createResponse';
import { isString } from '@utils/guards/isString';
import { sanitizeInputBackEnd } from '@utils/sanitize/sanitizeInputBackEnd';
import { validateUsername, validateEmail, validatePassword } from '@utils/validation';

//import { createBossList } from '@/services/bossList';
//import { createMissingCharacters } from '@/services/character';
//import { searchServersAndCreateMissing } from '@/services/server';

export async function POST(req: NextRequest) {
	try {
		await connectToDatabase();

		let rawBody: unknown;

		// Parse JSON body and fail early if malformed
		try {
			rawBody = await req.json();
		} catch {
			return createResponse({ success: false, error: 'Invalid JSON payload' }, 400);
		}

		// Assert rawBody shape as SignupRequestBody
		const body = rawBody as SignupRequestBody;

		// Validate that the properties are strings
		if (!isString(body.username) || !isString(body.email) || !isString(body.password)) {
			return createResponse({ success: false, error: 'Invalid request body' }, 400);
		}

		// Sanitize inputs
		const username = sanitizeInputBackEnd(body.username);
		const email = sanitizeInputBackEnd(body.email);
		const password = sanitizeInputBackEnd(body.password);

		if (!username || !email || !password) {
			return createResponse({ success: false, error: 'Missing required fields' }, 400);
		}

		// Validate sanitized inputs
		const usernameValidation = validateUsername(username);
		const emailValidation = validateEmail(email);
		const passwordValidation = validatePassword(password);

		// If any validation fails, return early
		if (!usernameValidation.isValid || !emailValidation.isValid || !passwordValidation.isValid) {
			return createResponse(
				{
					success: false,
					error: 'Validation failed',
					details: {
						username: usernameValidation.error,
						email: emailValidation.error,
						password: passwordValidation.error,
					},
				},
				400
			);
		}

		// Check if username or email already exists after validation
		const existingUser = await User.findOne({ $or: [{ username }, { email }] });
		if (existingUser) {
			return createResponse(
				{
					success: false,
					error: 'This username or email is not available.',
				},
				400
			);
		}

		// Hash password with auto-generated salt (10 rounds)
		const hashedPassword = await bcrypt.hash(password, 10);

		const newUser = new User({
			username,
			email,
			password: hashedPassword,
			version: LASTVERSION,
			resetPasswordToken: null,
			resetPasswordExpires: null,
		});

		// Save user
		await newUser.save();

		// DB populate functions
		//await searchServersAndCreateMissing(newUser.username, newUser._id);
		//await createMissingCharacters(newUser._id, newUser.username);
		//await createBossList(newUser.username);

		return createResponse(
			{
				success: true,
				message: 'User created successfully',
				data: {
					id: newUser._id,
					username: newUser.username,
					email: newUser.email,
				},
			},
			201
		);
	} catch (error) {
		console.error('Signup error:', error);
		return createResponse({ success: false, error: 'Internal Server Error' }, 500);
	}
}
