'use client';

import { useSearchParams } from 'next/navigation';
import { useState } from 'react';

export default function ResetPasswordPage() {
	const searchParams = useSearchParams();
	const token = searchParams.get('token');

	const [password, setPassword] = useState('');
	const [confirm, setConfirm] = useState('');
	const [loading, setLoading] = useState(false);
	const [msg, setMsg] = useState('');
	const [error, setError] = useState('');

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setError('');
		setMsg('');

		if (!token) {
			setError('Token is missing from the URL.');
			return;
		}

		if (password.length < 8) {
			setError('Password must be at least 8 characters long.');
			return;
		}

		if (password !== confirm) {
			setError('Passwords do not match.');
			return;
		}

		setLoading(true);
		try {
			const res = await fetch('/api/auth/reset-password', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ token, password }),
			});

			const data = await res.json();
			console.log(data);

			if (!res.ok) {
				setError(data.error || 'Something went wrong.');
			} else {
				setMsg(data.message || 'Password reset successfully!');
			}
		} catch (err) {
			setError('Something went wrong.');
		} finally {
			setLoading(false);
		}
	};

	return (
		<div style={{ maxWidth: 400, margin: '50px auto', padding: 20 }}>
			<h2>Reset Password</h2>
			<form onSubmit={handleSubmit}>
				<input
					type="password"
					placeholder="New password"
					value={password}
					onChange={(e) => setPassword(e.target.value)}
					style={{ width: '100%', padding: 10, marginBottom: 10 }}
				/>
				<input
					type="password"
					placeholder="Confirm new password"
					value={confirm}
					onChange={(e) => setConfirm(e.target.value)}
					style={{ width: '100%', padding: 10, marginBottom: 10 }}
				/>
				<button type="submit" disabled={loading} style={{ width: '100%', padding: 10 }}>
					{loading ? 'Resetting...' : 'Reset Password'}
				</button>
				{msg && <p style={{ color: 'green', marginTop: 10 }}>{msg}</p>}
				{error && <p style={{ color: 'red', marginTop: 10 }}>{error}</p>}
			</form>
		</div>
	);
}
