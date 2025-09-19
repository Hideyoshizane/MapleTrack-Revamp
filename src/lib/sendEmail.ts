import nodemailer from 'nodemailer';

interface SendEmailParams {
	to: string;
	subject: string;
	text?: string;
	html?: string;
}

export const sendEmail = async ({ to, subject, text, html }: SendEmailParams): Promise<nodemailer.SentMessageInfo> => {
	// Create transporter using Gmail service
	const transporter = nodemailer.createTransport({
		service: 'gmail',
		auth: {
			user: process.env.GMAIL_USER as string,
			pass: process.env.GMAIL_APP_PASSWORD as string,
		},
	});

	// Mail options including sender, recipient, subject, and body
	const mailOptions = {
		from: `"MapleTrack" <${process.env.GMAIL_USER}>`,
		to,
		subject,
		text,
		html,
	};

	// Send the email
	const info = await transporter.sendMail(mailOptions);
	return info;
};
