'use client';

import { useState, useEffect } from 'react';

import { validateEmail } from '@utils/validationUtils';
import sanitizeInputFrontEnd from '@utils/sanitizeInputFrontEnd';

export default function ForgotPasswordPage() {
	const [email, setEmail] = useState('');
	const [msg, setMsg] = useState('');
	const [error, setError] = useState('');
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [isValidEmail, setIsValidEmail] = useState(true);

	// Optional: validate email on change with debounce (300ms)
	useEffect(() => {
		if (!email) {
			setIsValidEmail(true);
			setError('');
			return;
		}
		const timer = setTimeout(() => {
			const { isValid, error } = validateEmail(email);
			setIsValidEmail(isValid);
			setError(isValid ? '' : error);
		}, 300);
		return () => clearTimeout(timer);
	}, [email]);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setMsg('');
		setError('');

		// Sanitize input
		const sanitizedEmail = sanitizeInputFrontEnd(email.trim());

		// Validate before sending
		const { isValid, error } = validateEmail(sanitizedEmail);
		if (!isValid) {
			setError(error);
			return;
		}

		setIsSubmitting(true);

		try {
			const res = await fetch('/api/auth/forgot-password', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ email: sanitizedEmail }),
			});

			const data = await res.json();

			if (!res.ok) {
				throw new Error(data.message || 'Something went wrong');
			}

			setMsg(data.message || 'If the email exists, a reset link has been sent.');
			setEmail(''); // Clear input on success
		} catch (err: any) {
			setError(err.message || 'Unexpected error');
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<div className="max-w-md mx-auto mt-10 p-4 border rounded shadow">
			<h1 className="text-2xl font-semibold text-center mb-4">Forgot Password</h1>
			<form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
				<input
					type="email"
					className={`p-2 border rounded focus:outline-none focus:ring-2 ${
						isValidEmail ? 'border-gray-300 focus:ring-blue-500' : 'border-red-500 focus:ring-red-500'
					}`}
					placeholder="Enter your email"
					value={email}
					onChange={(e) => setEmail(e.target.value)}
					required
					aria-invalid={!isValidEmail}
					aria-describedby="email-error"
					disabled={isSubmitting}
					autoComplete="email"
				/>
				<button
					type="submit"
					className="bg-blue-600 text-white p-2 rounded hover:bg-blue-700 disabled:opacity-50"
					disabled={isSubmitting || !email || !isValidEmail}
					aria-busy={isSubmitting}>
					{isSubmitting ? 'Sending...' : 'Send Reset Link'}
				</button>
				{msg && (
					<p className="text-green-600" role="alert">
						{msg}
					</p>
				)}
				{error && (
					<p className="text-red-600" id="email-error" role="alert" aria-live="assertive">
						{error}
					</p>
				)}
			</form>
		</div>
	);
}
