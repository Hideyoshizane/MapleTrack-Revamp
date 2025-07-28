import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import User from '@models/user';
import connectToDatabase from '@lib/mongooseConect';

import { validateEmail } from '@/utils/validation/';
import { sanitizeInputBackEnd } from '@/utils/sanitize/sanitizeInputBackEnd';

import sendEmail from '@lib/sendEmail';
import getForgotPasswordTemplate from '@lib/resetPasswordEmail';

export async function POST(req: NextRequest) {
	await connectToDatabase();

	const { email } = await req.json();

	// Sanitize input
	const sanitizedEmail = sanitizeInputBackEnd(email);

	// Validate before sending
	const { isValid, error } = validateEmail(sanitizedEmail);
	if (!isValid) {
		return NextResponse.json({ error }, { status: 400 });
	}

	// search for user by the sanitized email
	const user = await User.findOne({ email: sanitizedEmail });

	if (!user) {
		return NextResponse.json({ message: 'If the email exists, we sent a reset link.' }, { status: 200 });
	}
	// Generate the Token to be send and stored
	const token = crypto.randomBytes(32).toString('hex');
	const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

	// Store on user database
	user.resetPasswordToken = hashedToken;
	user.resetPasswordExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes from now
	await user.save();

	// Send email here
	const domainURL = req.nextUrl.origin;
	const username = user.username;
	const html = getForgotPasswordTemplate(`${domainURL}/reset-password?token=${token}`, username);

	await sendEmail({
		to: sanitizedEmail,
		subject: 'Reset Your Password',
		html,
	});
	return NextResponse.json({ message: 'Reset link sent' });
}
