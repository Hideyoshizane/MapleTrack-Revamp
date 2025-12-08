import nodemailer from 'nodemailer';

// Create transporter using Gmail service
const transporter = nodemailer.createTransport({
	service: 'gmail',
	auth: {
		user: process.env.GMAIL_USER as string,
		pass: process.env.GMAIL_APP_PASSWORD as string,
	},
});

const FROM_EMAIL = `"MapleTrack" <${process.env.GMAIL_USER}>`;

type SendEmailParams = {
	to: string;
	subject: string;
	text?: string;
	html?: string;
};

export const sendEmail = async ({ to, subject, text, html }: SendEmailParams): Promise<nodemailer.SentMessageInfo> => {
	try {
		const info = await transporter.sendMail({
			from: FROM_EMAIL,
			to,
			subject,
			text,
			html,
		});
		return info;
	} catch (error) {
		console.error('Failed to send email:', error);
		throw error;
	}
};
