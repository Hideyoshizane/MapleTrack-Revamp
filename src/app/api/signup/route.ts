import { NextRequest, NextResponse } from 'next/server';

import connectToDatabase from '@lib/mongooseConect';
import User, { LASTVERSION } from '@models/user';
import { validateUsername, validateEmail, validatePassword } from '@/utils/validation';
import { sanitizeInputBackend } from '@/utils/sanitize/sanitizeInputBackEnd';

import bcrypt from 'bcrypt';
//import { createBossList } from '@/services/bossList';
//import { createMissingCharacters } from '@/services/character';
//import { searchServersAndCreateMissing } from '@/services/server';

export async function POST(req: NextRequest) {
	try {
		await connectToDatabase();

		let body;
		// Parse JSON body and fail early if malformed
		try {
			body = await req.json();
		} catch {
			return NextResponse.json({ error: 'Invalid JSON payload' }, { status: 400 });
		}

		// Sanitize inputs
		const username = sanitizeInputBackend(body.username);
		const email = sanitizeInputBackend(body.email);
		const password = sanitizeInputBackend(body.password);

		if (!username || !email || !password) {
			return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
		}

		// Validate sanitized inputs
		const usernameValidation = validateUsername(username);
		const emailValidation = validateEmail(email);
		const passwordValidation = validatePassword(password);

		// If any validation fails, return early
		if (!usernameValidation.isValid || !emailValidation.isValid || !passwordValidation.isValid) {
			return NextResponse.json(
				{
					error: 'Validation failed',
					details: {
						username: usernameValidation.error,
						email: emailValidation.error,
						password: passwordValidation.error,
					},
				},
				{ status: 400 }
			);
		}

		// Check if username or email already exists after validation
		const existingUser = await User.findOne({ $or: [{ username }, { email }] });
		if (existingUser) {
			return NextResponse.json({ error: 'This username or email is not avaiable.' }, { status: 400 });
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

		return NextResponse.json({ message: 'User created successfully' }, { status: 201 });
	} catch (error) {
		console.error('Signup error:', error);
		return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
	}
}
