import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import User from '@models/user';
import { updateLastLogin } from '@service/userService';
import connectToDatabase from '@lib/mongooseConect';

import { validateUsernameLogin, validatePasswordLogin } from '@/utils/validation';
import { sanitizeInputBackEnd } from '@/utils/sanitize/sanitizeInputBackEnd';

export async function POST(req: NextRequest) {
	try {
		await connectToDatabase();

		let body;
		try {
			body = await req.json();
		} catch {
			return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
		}

		// Sanitize inputs
		const username = sanitizeInputBackEnd(body.username);
		const password = sanitizeInputBackEnd(body.password);

		if (!username || !password) {
			return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
		}

		// Validate sanitized inputs
		const usernameValidation = validateUsernameLogin(username);
		const passwordValidation = validatePasswordLogin(password);

		// If any validation fails, return early
		if (!usernameValidation.isValid || !passwordValidation.isValid) {
			return NextResponse.json(
				{
					error: 'Invalid username or password. Please try again.',
					details: {
						username: usernameValidation.error,
						password: passwordValidation.error,
					},
				},
				{ status: 400 }
			);
		}

		// Check if username or email already exists after validation
		const user = await User.findOne({ username });
		if (!user) {
			return NextResponse.json({ error: 'Wrong username or password.' }, { status: 400 });
		}

		// Compare passwords if is a match
		const passwordMatch = await bcrypt.compare(password, user.password);
		if (!passwordMatch) {
			return NextResponse.json({ error: 'Wrong username or password.' }, { status: 400 });
		}

		//User specific functions.
		/*if (user.version < LASTVERSION) {
			await searchServersAndCreateMissing(user, user._id);
			await createMissingCharacters(user._id, user.username);
			await updateCharacters(user._id);
			await updateUserVersion(user._id); 	
		}*/

		//updateLastLogin(user);
		//await resetBossList(user.username);

		await user.save();

		//const token = jwt.sign({ _id: user._id, username: user.username }, process.env.SECRET, { expiresIn: '30d' });
		//res.cookie('token', token, { httpOnly: true, maxAge: 30 * 24 * 60 * 60 * 1000, secure: true });
		//res.redirect('/home');

		return NextResponse.json({ message: 'User autenticated!' }, { status: 201 });
	} catch (error) {
		console.error('Signup error:', error);
		return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
	}
}
