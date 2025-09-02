import bcrypt from 'bcrypt';
import { NextRequest } from 'next/server';

import connectToDatabase from '@lib/mongooseConect';
import User, { LASTVERSION } from '@models/user';
import { signupRequestSchema } from '@schemas/authSchemas';
import { ApiResponse } from '@sharedTypes/api/api';
import { createResponse } from '@utils/api/createResponse';
import { sanitizeInputBackEnd } from '@utils/sanitize/sanitizeInputBackEnd';
import { validateUsername, validateEmail, validatePassword } from '@utils/validation';

//import { createBossList } from '@/services/bossList';
//import { createMissingCharacters } from '@/services/character';
//import { searchServersAndCreateMissing } from '@/services/server';

export async function POST(req: NextRequest) {
	try {
		await connectToDatabase();

		// Parse JSON safely
		let rawBody: unknown;
		try {
			rawBody = await req.json();
		} catch {
			return createResponse<ApiResponse>({ success: false, error: 'Invalid JSON payload' }, 400);
		}

		// Validate request body using Zod
		const parseResult = signupRequestSchema.safeParse(rawBody);
		if (!parseResult.success) {
			return createResponse<ApiResponse>({ success: false, error: 'Invalid request body' }, 400);
		}

		const { username: rawUsername, email: rawEmail, password: rawPassword } = parseResult.data;

		// Sanitize inputs
		const username = sanitizeInputBackEnd(rawUsername);
		const email = sanitizeInputBackEnd(rawEmail);
		const password = sanitizeInputBackEnd(rawPassword);
		if (!username || !email || !password) {
			return createResponse<ApiResponse>({ success: false, error: 'Missing required fields' }, 400);
		}

		// Validate sanitized inputs
		const usernameValidation = validateUsername(username);
		const emailValidation = validateEmail(email);
		const passwordValidation = validatePassword(password);
		if (!usernameValidation.isValid || !emailValidation.isValid || !passwordValidation.isValid) {
			return createResponse<ApiResponse>(
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
			return createResponse<ApiResponse>({ success: false, error: 'This username or email is not available.' }, 400);
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
		//await createMissingCharacters(newUser._id, newUser.username);
		//await createBossList(newUser.username);

		return createResponse<ApiResponse<{ id: string; username: string; email: string }>>(
			{
				success: true,
				message: 'User created successfully',
				data: {
					id: newUser._id.toString(),
					username: newUser.username,
					email: newUser.email,
				},
			},
			201
		);
	} catch (error) {
		console.error('Signup error:', error);
		return createResponse<ApiResponse>({ success: false, error: 'Internal Server Error' }, 500);
	}
}
