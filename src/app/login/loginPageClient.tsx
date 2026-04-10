'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';

import Button from '@components/Button/button';
import FooterOutside from '@components/FooterOutside/footerOutside';
import FormInput from '@components/FormInput/formInput';
import { validateUsernameLogin, validatePasswordLogin } from '@utils/validators';

import { useLogin } from './hooks/useLogin';
import { useToastQueryParams } from './hooks/useToastQueryParams';
import styles from './page.module.scss';

import type { LoginFormData } from '@sharedTypes/form';
import type { JSX } from 'react';

const LoginPageClient = (): JSX.Element => {
	const {
		control,
		handleSubmit,
		formState: { isSubmitting, isSubmitted },
		setError,
	} = useForm<LoginFormData>({ mode: 'onBlur', defaultValues: { username: '', password: '' } });
	const router = useRouter();

	const { submitLogin } = useLogin(setError, router);

	useToastQueryParams();

	const commonInputProps = { control, isSubmitted };

	return (
		<div className={styles.container}>
			<div className={styles.logoDiv}>
				<Image src="/assets/logo/logo.webp" priority fill sizes="750px" alt="MapleTrack Logo" />
			</div>

			<form onSubmit={(e): undefined => void handleSubmit(submitLogin)(e)} noValidate>
				<FormInput<LoginFormData>
					id="username"
					label="Username"
					type="text"
					validation={validateUsernameLogin}
					{...commonInputProps}
					isLogin={true}
				/>

				<FormInput<LoginFormData>
					id="password"
					label="Password"
					type="password"
					validation={validatePasswordLogin}
					{...commonInputProps}
					isLogin={true}
				/>
				<div>
					<Link href="/forgot-password" className={styles.forgotPassword}>
						Forgot password?
					</Link>
				</div>

				<Button
					type="submit"
					className={styles.submitButton}
					isLoading={isSubmitting}
					loadingText="Loading..."
					loaderSize={16}
					loaderColor="#121212"
					loaderBorderWidth={3}
					aria-label="Submit form">
					Login
				</Button>

				<p className={styles.signupText}>
					Don&apos;t have an account?{' '}
					<Link href="/signup" className={styles.signupLink}>
						Sign up
					</Link>
				</p>
			</form>

			<FooterOutside />
		</div>
	);
};

export default LoginPageClient;
