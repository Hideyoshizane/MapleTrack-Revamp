import nodemailer from 'nodemailer';

interface SendEmailParams {
	to: string;
	subject: string;
	text?: string;
	html?: string;
}

export default async function sendEmail({ to, subject, text, html }: SendEmailParams) {
	const transporter = nodemailer.createTransport({
		service: 'gmail',
		auth: {
			user: process.env.GMAIL_USER as string,
			pass: process.env.GMAIL_APP_PASSWORD as string,
		},
	});

	const mailOptions = {
		from: `"MapleTrack" <${process.env.GMAIL_USER}>`,
		to,
		subject,
		text,
		html,
	};

	const info = await transporter.sendMail(mailOptions);
	return info;
}
