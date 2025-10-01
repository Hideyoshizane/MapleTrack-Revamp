import bcrypt from 'bcrypt';

import connectToDatabase from '@lib/mongooseConect';
import User, { LASTVERSION } from '@models/user';
import { signupRequestSchema } from '@schemas/authSchemas';
import { createResponse } from '@utils/api/createResponse';
import { sanitizeInputBackEnd } from '@utils/sanitize/sanitizeInputBackEnd';
import { validateUsername, validateEmail, validatePassword } from '@utils/validation';

import type { ApiResponse } from '@sharedTypes/api';
import type { NextRequest, NextResponse } from 'next/server';

//import { createBossList } from '@/services/bossList';
//import { createMissingCharacters } from '@/services/character';
//import { searchServersAndCreateMissing } from '@/services/server';

export const POST = async (request: NextRequest): Promise<NextResponse> => {
	try {
		await connectToDatabase();

		// Validate request body using Zod
		const parseResult = signupRequestSchema.safeParse(await request.json());
		if (!parseResult.success) {
			return createResponse<ApiResponse>({ success: false, error: 'Invalid request body' }, 400);
		}

		// Sanitize inputs
		const username = sanitizeInputBackEnd(parseResult.data.username);
		const email = sanitizeInputBackEnd(parseResult.data.email);
		const password = sanitizeInputBackEnd(parseResult.data.password);
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
};
