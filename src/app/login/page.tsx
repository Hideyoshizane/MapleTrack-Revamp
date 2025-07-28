'use client';

import Image from 'next/image';
import Link from 'next/link';

import { useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { useSearchParams, useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { signIn } from 'next-auth/react';

import FormInput from '@components/FormInput/FormInput';
import FooterOutside from '@/components/FooterOutside/FooterOutside';
import Button from '@/components/Button/Button';

import { validateUsernameLogin, validatePasswordLogin } from '@/utils/validation';
import { sanitizeInputFrontend } from '@/utils/sanitize';

import type { LoginFormData } from '@/sharedTypes/form';

import styles from './page.module.css';

export default function LoginPage() {
	const searchParams = useSearchParams();
	const router = useRouter();

	// prevents duplicate toasts on rerender
	const hasShownToast = useRef(false);

	useEffect(() => {
		const success = searchParams.get('success');
		const unauthorized = searchParams.get('unauthorized');

		if (!hasShownToast.current) {
			if (success === '1') {
				toast.success('Account created! Please log in.');
				hasShownToast.current = true;
				router.replace('/login');
			} else if (unauthorized === '1') {
				toast.error('You must be logged in to access that page.');
				hasShownToast.current = true;
				router.replace('/login');
			}
		}
	}, [searchParams, router]);

	const {
		register,
		handleSubmit,
		formState: { errors, isSubmitting, isSubmitted },
		setError,
	} = useForm<LoginFormData>({
		mode: 'onBlur', // Validate when field loses focus
	});

	const onSubmit = async (data: LoginFormData) => {
		try {
			// Sanitize input to avoid XSS
			const username = sanitizeInputFrontend(data.username);
			const password = sanitizeInputFrontend(data.password);

			// Client-side validation
			const usernameValidation = validateUsernameLogin(username);
			const passwordValidation = validatePasswordLogin(password);

			let hasErrors = false;
			if (!usernameValidation.isValid) {
				setError('username', { message: usernameValidation.error });
				toast.error(usernameValidation.error ?? 'Invalid username');
				hasErrors = true;
			}
			if (!passwordValidation.isValid) {
				setError('password', { message: passwordValidation.error });
				toast.error(passwordValidation.error ?? 'Invalid password');
				hasErrors = true;
			}
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

			<form onSubmit={handleSubmit(onSubmit)} noValidate>
				<FormInput
					id="username"
					label="Username"
					type="text"
					register={register('username')}
					error={errors.username}
					isSubmitted={isSubmitted}
					isLogin
				/>

				<FormInput
					id="password"
					label="Password"
					type="password"
					register={register('password')}
					error={errors.password}
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
