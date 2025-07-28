import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import bcrypt from 'bcrypt';
import User from '@models/user';
import connectToDatabase from '@lib/mongooseConect';

import { validatePassword } from '@/utils/validation/';
import { sanitizeInputBackEnd } from '@/utils/sanitize/sanitizeInputBackEnd';

export async function POST(req: NextRequest) {
	await connectToDatabase();

	const { token, password } = await req.json();

	if (!token || !password) {
		return NextResponse.json({ error: 'Token and password are required.' }, { status: 400 });
	}

	// Sanitize input
	const sanitizedPassword = sanitizeInputBackEnd(password);

	// Validate before sending
	const { isValid, error } = validatePassword(sanitizedPassword);
	if (!isValid) {
		return NextResponse.json({ error }, { status: 400 });
	}

	// Generate the hash token
	const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

	// Search for the user using the token
	const user = await User.findOne({
		resetPasswordToken: hashedToken,
		resetPasswordExpires: { $gt: Date.now() },
	});

	if (!user) {
		return NextResponse.json({ error: 'Invalid or expired token.' }, { status: 400 });
	}

	// Hash new password and update user
	const hashedPassword = await bcrypt.hash(password, 10);

	user.password = hashedPassword;
	user.resetPasswordToken = undefined;
	user.resetPasswordExpires = undefined;

	await user.save();

	return NextResponse.json({ message: 'Password reset successful!' });
}
