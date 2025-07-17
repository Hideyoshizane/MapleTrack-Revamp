'use client';

import { useState } from 'react';

export default function SignupPage() {
	const [form, setForm] = useState({ username: '', email: '', password: '' });
	const [loading, setLoading] = useState(false);
	const [message, setMessage] = useState<string | null>(null);
	const [errors, setErrors] = useState<{ username?: string; email?: string; password?: string }>({});

	async function handleSubmit(e: React.FormEvent) {
		e.preventDefault();
		setLoading(true);
		setMessage(null);
		setErrors({});

		try {
			const res = await fetch('/api/signup', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(form),
			});

			const data = await res.json();

			if (res.ok) {
				setMessage(data.message || 'User created successfully!');
				setForm({ username: '', email: '', password: '' });
			} else {
				setMessage(data.error || 'Failed to create user');
				if (data.details) setErrors(data.details);
			}
		} catch (err) {
			setMessage('Unexpected error occurred');
		} finally {
			setLoading(false);
		}
	}

	function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
		setForm({ ...form, [e.target.name]: e.target.value });
	}

	return (
		<main style={{ maxWidth: 400, margin: '2rem auto', padding: '0 1rem' }}>
			<h1>Signup Form</h1>
			<form onSubmit={handleSubmit} noValidate>
				<div style={{ marginBottom: '1rem' }}>
					<label htmlFor="username" style={{ display: 'block' }}>
						Username
					</label>
					<input
						type="text"
						id="username"
						name="username"
						value={form.username}
						onChange={handleChange}
						required
						minLength={3}
					/>
					{errors.username && <p style={{ color: 'red' }}>{errors.username}</p>}
				</div>

				<div style={{ marginBottom: '1rem' }}>
					<label htmlFor="email" style={{ display: 'block' }}>
						Email
					</label>
					<input type="email" id="email" name="email" value={form.email} onChange={handleChange} required />
					{errors.email && <p style={{ color: 'red' }}>{errors.email}</p>}
				</div>

				<div style={{ marginBottom: '1rem' }}>
					<label htmlFor="password" style={{ display: 'block' }}>
						Password
					</label>
					<input
						type="password"
						id="password"
						name="password"
						value={form.password}
						onChange={handleChange}
						required
						minLength={8}
					/>
					{errors.password && <p style={{ color: 'red' }}>{errors.password}</p>}
				</div>

				<button type="submit" disabled={loading} style={{ padding: '0.5rem 1rem' }}>
					{loading ? 'Submitting...' : 'Sign Up'}
				</button>
			</form>

			{message && (
				<p style={{ marginTop: '1rem', color: message.includes('successfully') ? 'green' : 'red' }}>{message}</p>
			)}
		</main>
	);
}
