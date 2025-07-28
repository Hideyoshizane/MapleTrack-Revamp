'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';

import FormInput from '@components/FormInput/FormInput';
import FooterOutside from '@/components/FooterOutside/FooterOutside';
import Button from '@/components/Button/Button';

import { validateUsername, validateEmail, validatePassword, validatePasswordConfirmation } from '@/utils/validation';
import { sanitizeInputFrontend } from '@/utils/sanitize';

import type { SignupFormData } from '@/sharedTypes/form';

import styles from './page.module.css';

export default function SignupPage() {
	const {
		register,
		handleSubmit,
		formState: { errors, isSubmitting, isSubmitted },
		setError,
		clearErrors,
		getValues,
	} = useForm<SignupFormData>({
		mode: 'onBlur', // Validate on blur for better UX
	});

	const router = useRouter();
	const onSubmit = async (data: SignupFormData) => {
		try {
			// Sanitize inputs to avoid XSS
			const sanitizedData: SignupFormData = {
				username: sanitizeInputFrontend(data.username),
				email: sanitizeInputFrontend(data.email),
				password: sanitizeInputFrontend(data.password),
				confirmPassword: sanitizeInputFrontend(data.confirmPassword),
			};

			// Client-side validation results
			const validations = {
				username: validateUsername(sanitizedData.username),
				email: validateEmail(sanitizedData.email),
				password: validatePassword(sanitizedData.password),
				confirmPassword: validatePasswordConfirmation(sanitizedData.password, sanitizedData.confirmPassword),
			};

			// If any validation fails, set errors and abort submission
			let hasErrors = false;
			for (const [field, result] of Object.entries(validations)) {
				if (!result.isValid) {
					setError(field as keyof SignupFormData, { message: result.error });
					hasErrors = true;
				}
			}
			if (hasErrors) return;

			// Prepare payload for API, excluding confirmPassword as it's only client-side
			const payload = {
				username: sanitizedData.username,
				email: sanitizedData.email,
				password: sanitizedData.password,
			};

			// Call API with timeout wrapper to avoid hanging requests
			const controller = new AbortController();
			const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout

			const response = await fetch('/api/signup', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(payload),
				signal: controller.signal,
			});

			clearTimeout(timeoutId);

			const result = await response.json();

			if (response.ok) {
				// Redirect to login with success query param
				router.push('/login?success=1');
			} else {
				// Show toast error with fallback message
				toast.error(result.error || 'Failed to create user');

				// Set field-specific errors if provided
				if (result.details && typeof result.details === 'object') {
					for (const [field, msg] of Object.entries(result.details)) {
						setError(field as keyof SignupFormData, { message: msg as string });
					}
				}
			}
		} catch (error: unknown) {
			// Handle fetch errors or aborts gracefully
			if ((error as DOMException).name === 'AbortError') {
				toast.error('Request timed out. Please try again.');
			} else {
				toast.error('Unexpected error occurred');
				console.error('Signup error:', error);
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

			<h1 className={styles.title}>Create a new account</h1>

			<form onSubmit={handleSubmit(onSubmit)} noValidate>
				<FormInput
					id="username"
					label="Username"
					type="text"
					register={register('username')}
					error={errors.username}
					validation={(value) => validateUsername(value)}
					setError={setError}
					clearErrors={clearErrors}
					isSubmitted={isSubmitted}
				/>

				<FormInput
					id="email"
					label="Email"
					type="email"
					register={register('email')}
					error={errors.email}
					validation={(value) => validateEmail(value)}
					setError={setError}
					clearErrors={clearErrors}
					isSubmitted={isSubmitted}
				/>

				<FormInput
					id="password"
					label="Password"
					type="password"
					register={register('password')}
					error={errors.password}
					validation={(value) => validatePassword(value)}
					setError={setError}
					clearErrors={clearErrors}
					isSubmitted={isSubmitted}
				/>

				<FormInput
					id="confirmPassword"
					label="Confirm Password"
					type="password"
					register={register('confirmPassword')}
					error={errors.confirmPassword}
					validation={(value) => validatePasswordConfirmation(getValues('password'), value)}
					setError={setError}
					clearErrors={clearErrors}
					isSubmitted={isSubmitted}
				/>

				<Button type="submit" disabled={isSubmitting} className={styles.submitButton} aria-busy={isSubmitting}>
					{isSubmitting ? 'Submitting...' : 'Sign Up'}
				</Button>
			</form>

			<FooterOutside />
		</main>
	);
}
