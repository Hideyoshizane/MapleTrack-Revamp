'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { signIn, useSession } from 'next-auth/react';
import { useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';

import Button from '@components/Button/Button';
import FooterOutside from '@components/FooterOutside/FooterOutside';
import FormInput from '@components/FormInput/FormInput';
import { sanitizeInputFrontend } from '@utils/sanitize';
import { validateUsernameLogin, validatePasswordLogin, handleFieldValidation } from '@utils/validation';

import styles from './page.module.css';

import type { LoginFormData } from '@sharedTypes/form';
import type { ValidationResult } from '@utils/validation';

export default function LoginPage() {
	const router = useRouter();
	const searchParams = useSearchParams();
	const { status } = useSession();

	// Prevents duplicate toasts on rerender
	const hasShownToast = useRef(false);

	// Redirect to /home if user is already authenticated
	useEffect(() => {
		if (status === 'authenticated') {
			router.push('/home');
		}
	}, [status, router]);

	useEffect(() => {
		// Prevent duplicate toast messages
		if (hasShownToast.current) return;

		// Define inside the effect to avoid dependency warnings
		const toastMessages: Record<string, { message: string; type: 'success' | 'error' }> = {
			success: {
				message: 'Account created! Please log in.',
				type: 'success',
			},
			reset: {
				message: 'Reset password successfully! Please log in.',
				type: 'success',
			},
			unauthorized: {
				message: 'You must be logged in to access that page.',
				type: 'error',
			},
		};

		for (const [param, { message, type }] of Object.entries(toastMessages)) {
			const value = searchParams.get(param);
			if (value === '1') {
				if (type === 'success') {
					toast.success(message);
				} else {
					toast.error(message);
				}

				hasShownToast.current = true;

				// Redirect to login and remove query params
				router.replace('/login');
				break;
			}
		}
	}, [searchParams, router]);

	const {
		register,
		handleSubmit,
		formState: { errors, isSubmitting, isSubmitted },
		setError,
		clearErrors,
	} = useForm<LoginFormData>({
		mode: 'onBlur', // Validate when field loses focus
	});

	const onSubmit = async (data: LoginFormData) => {
		try {
			// Sanitize input to avoid XSS
			const username = sanitizeInputFrontend(data.username);
			const password = sanitizeInputFrontend(data.password);

			// Client-side validation
			const validations = {
				username: validateUsernameLogin(username),
				password: validatePasswordLogin(password),
			};

			// If any validation fails, set errors and abort submission
			let hasErrors = false;
			(Object.entries(validations) as [keyof typeof validations, ValidationResult][]).forEach(([field, result]) => {
				const errorFound = handleFieldValidation(field, result, setError);
				if (errorFound) hasErrors = true;
			});
			if (hasErrors) return;

			// Use NextAuth signIn with credentials
			const res = await signIn('credentials', {
				redirect: false,
				username,
				password,
			});

			if (res?.error) {
				toast.error(res.error);
				// Optionally map error to field errors if possible
			} else {
				toast.success('Login successful!');
				router.push('/home'); // redirect after login success
			}
		} catch (err) {
			toast.error('Unexpected error occurred');
			console.error('Login error:', err);
		}
	};

	return (
		<main className={styles.container}>
			<div className={styles.logoDiv}>
				<Image
					src="/assets/logo/logo.webp"
					priority
					fill
					sizes="(max-width: 1024px) 100vw, 880px"
					alt="MapleTrack Logo"
				/>
			</div>

			<form onSubmit={(e) => void handleSubmit(onSubmit)(e)} noValidate>
				<FormInput<LoginFormData>
					id="username"
					label="Username"
					type="text"
					register={register('username')}
					error={errors.username}
					setError={setError}
					clearErrors={clearErrors}
					isSubmitted={isSubmitted}
					isLogin
				/>

				<FormInput<LoginFormData>
					id="password"
					label="Password"
					type="password"
					register={register('password')}
					error={errors.password}
					setError={setError}
					clearErrors={clearErrors}
					isSubmitted={isSubmitted}
					isLogin
				/>
				<Link href="/forgot-password" passHref>
					<p className={styles.forgotPassword}>Forgot password?</p>
				</Link>

				<Button type="submit" disabled={isSubmitting} className={styles.submitButton} aria-busy={isSubmitting}>
					{isSubmitting ? 'Submitting...' : 'Login'}
				</Button>

				<p className={styles.signupText}>
					Don&apos;t have an account?{' '}
					<Link href="/signup" passHref>
						<span className={styles.signupLink}>Sign up</span>
					</Link>
				</p>
			</form>

			<FooterOutside />
		</main>
	);
}
