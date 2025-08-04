'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';

import LockIcon from '@assets/svg/lock.svg';
import Button from '@components/Button/Button';
import FooterOutside from '@components/FooterOutside/FooterOutside';
import FormInput from '@components/FormInput/FormInput';
import { fetchWithTimeout } from '@utils/fetch/withTimeout';
import { sanitizeInputFrontend } from '@utils/sanitize';
import { validateEmail, handleFieldValidation } from '@utils/validation';

import styles from './page.module.css';

import type { ForgotPasswordApiResponse } from '@sharedTypes/api/auth';
import type { ForgotPasswordFormData } from '@sharedTypes/form';
import type { ValidationResult } from '@utils/validation';

export default function ForgotPasswordPage() {
	const {
		register,
		handleSubmit,
		formState: { errors, isSubmitting, isSubmitted },
		setError,
		clearErrors,
	} = useForm<ForgotPasswordFormData>({
		mode: 'onBlur', // Validate when field loses focus
	});

	const onSubmit = async (data: ForgotPasswordFormData) => {
		try {
			// Sanitize input to avoid XSS
			const email = sanitizeInputFrontend(data.email);

			// Client-side validation results
			const validations = {
				email: validateEmail(email),
			};

			// Apply errors from validation results to form, abort if any found
			let hasErrors = false;
			(Object.entries(validations) as [keyof typeof validations, ValidationResult][]).forEach(([field, result]) => {
				const errorFound = handleFieldValidation(field, result, setError);
				if (errorFound) hasErrors = true;
			});
			if (hasErrors) return;

			// Prepare payload
			const payload = { email };

			const response = await fetchWithTimeout('/api/auth/forgot-password', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(payload),
			});

			const result = (await response.json()) as ForgotPasswordApiResponse;

			if (response.ok && result.success) {
				toast.success(result.message);
			} else if (!result.success) {
				toast.success(result.error || 'Failed to process your request');

				// Show field-level errors if available
				if (result.details) {
					for (const [field, msg] of Object.entries(result.details)) {
						setError(field as keyof ForgotPasswordFormData, {
							message: msg ?? 'Invalid input',
						});
					}
				}
			} else {
				toast.error('Unexpected response format');
			}
		} catch (err) {
			if ((err as DOMException).name === 'AbortError') {
				toast.error('Request timed out. Please try again.');
			} else {
				toast.error('Unexpected error occurred');
				console.error('Forgot password error:', err);
			}
		}
	};

	return (
		<main className={styles.container}>
			<Link href="/login" aria-label="Go to login page">
				<div className={styles.logoDiv}>
					<Image
						src="/assets/logo/logo.webp"
						priority
						fill
						sizes="(max-width: 1024px) 100vw, 880px"
						alt="MapleTrack Logo"
					/>
				</div>
			</Link>

			<div className={styles.titleDiv}>
				<LockIcon width={32} height={32} className={styles.icon} />
				<p className={styles.title}>Trouble logging in?</p>
			</div>

			<p className={styles.text}>Enter your email and we&apos;ll send you a link to reset your password.</p>

			<form onSubmit={(e) => void handleSubmit(onSubmit)(e)} noValidate>
				<FormInput<ForgotPasswordFormData>
					id="email"
					label="Email"
					type="email"
					register={register('email')}
					error={errors.email}
					validation={(value) => validateEmail(value)}
					setError={setError}
					clearErrors={clearErrors}
					isSubmitted={isSubmitted}
					isLogin
				/>

				<Button type="submit" disabled={isSubmitting} className={styles.submitButton} aria-busy={isSubmitting}>
					{isSubmitting ? 'Submitting...' : 'Send Reset Link'}
				</Button>

				<div className={styles.orDiv}>
					<div className={styles.bar}></div>
					<div className={styles.textBar}>OR</div>
					<div className={styles.bar}></div>
				</div>

				<Link href="/signup" passHref>
					<p className={styles.newAccount}>Create new account</p>
				</Link>
			</form>

			<FooterOutside />
		</main>
	);
}
