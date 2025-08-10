'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';

import Button from '@components/Button/Button';
import FooterOutside from '@components/FooterOutside/FooterOutside';
import FormInput from '@components/FormInput/FormInput';
import { fetchWithTimeout } from '@utils/fetch/withTimeout';
import { sanitizeInputFrontend } from '@utils/sanitize';
import {
	validateUsername,
	validateEmail,
	validatePassword,
	validatePasswordConfirmation,
	handleFieldValidation,
} from '@utils/validation';

import styles from './page.module.css';

import type { SignupApiResponse } from '@sharedTypes/api/auth';
import type { SignupFormData } from '@sharedTypes/form';
import type { ValidationResult } from '@utils/validation';

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

			// Apply errors from validation results to form, abort if any found
			let hasErrors = false;
			for (const [field, result] of Object.entries(validations) as [keyof SignupFormData, ValidationResult][]) {
				const errorFound = handleFieldValidation(field, result, setError);
				if (errorFound) hasErrors = true;
			}
			if (hasErrors) return;

			// Prepare payload for API, excluding confirmPassword as it's only client-side
			const payload = {
				username: sanitizedData.username,
				email: sanitizedData.email,
				password: sanitizedData.password,
			};

			const response = await fetchWithTimeout('/api/auth/signup', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(payload),
			});

			const result = (await response.json()) as SignupApiResponse;

			if (response.ok && result.success) {
				router.push('/login?success=1');
			} else if (!result.success) {
				toast.error(result.error || 'Failed to create user');

				if (result.details) {
					for (const [field, msg] of Object.entries(result.details)) {
						setError(field as keyof SignupFormData, { message: msg ?? 'Invalid input' });
					}
				}
			} else {
				// Fallback safety net (shouldn't normally hit this)
				toast.error('Failed to create user');
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
		<div className={styles.container}>
			<Link href="/login" aria-label="Go to login page">
				<div className={styles.logoDiv}>
					<Image src="/assets/logo/logo.webp" priority fill sizes="750px" alt="MapleTrack Logo" />
				</div>
			</Link>

			<h1 className={styles.title}>Create a new account</h1>

			<form onSubmit={(e) => void handleSubmit(onSubmit)(e)} noValidate>
				<FormInput<SignupFormData>
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

				<FormInput<SignupFormData>
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

				<FormInput<SignupFormData>
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

				<FormInput<SignupFormData>
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

				<Button
					type="submit"
					className={styles.submitButton}
					isLoading={isSubmitting}
					loadingText="Submitting..."
					loaderSize={16}
					loaderColor="#121212"
					loaderBorderWidth={3}
					aria-label="Submit form">
					Sign Up
				</Button>
			</form>

			<FooterOutside />
		</div>
	);
}
