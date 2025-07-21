import { NextRequest, NextResponse } from 'next/server';

import connectToDatabase from '@lib/mongooseConect';
import User, { LASTVERSION } from '@models/user';
import { validateUsername, validateEmail, validatePassword } from '@utils/validationUtils';
import sanitizeInputBackend from '@/utils/sanitizeInputBackEnd';

import bcrypt from 'bcrypt';
//import { createBossList } from '@/services/bossList';
//import { createMissingCharacters } from '@/services/character';
//import { searchServersAndCreateMissing } from '@/services/server';

export async function POST(req: NextRequest) {
	try {
		await connectToDatabase();

		const body = await req.json();

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

		// Check if username already exists AFTER validation
		const existingUser = await User.findOne({ $or: [{ username }, { email }] });
		if (existingUser) {
			return NextResponse.json({ error: 'This user or email is not avaiable.' }, { status: 400 });
		}

		// Hash password
		const salt = await bcrypt.genSalt(10);
		const hashedPassword = await bcrypt.hash(password, salt);

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
