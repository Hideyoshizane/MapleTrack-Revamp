'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';

import Button from '@components/Button/button';
import FooterOutside from '@components/FooterOutside/footerOutside';
import FormInput from '@components/FormInput/formInput';
import { usernameRawSchema, passwordRawSchema } from '@features/user/schemas/user.raw.schema';
import { zodValidator } from '@utils/validators';

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
	} = useForm<LoginFormData>({ mode: 'onBlur', defaultValues: { username: '', password: '' } });
	const router = useRouter();

	const { submitLogin } = useLogin(router);

	useToastQueryParams();

	const commonInputProps = { control, isSubmitted };

	return (
		<div className={styles.container}>
			<div className={styles.logoDiv}>
				<Image alt="MapleTrack Logo" fill priority sizes="750px" src="/assets/logo/logo.webp" />
			</div>

			<form noValidate onSubmit={(e): undefined => void handleSubmit(submitLogin)(e)}>
				<FormInput<LoginFormData>
					id="username"
					label="Username"
					type="text"
					validators={[zodValidator(usernameRawSchema)]}
					{...commonInputProps}
					isLogin={true}
				/>

				<FormInput<LoginFormData>
					id="password"
					label="Password"
					type="password"
					validators={[zodValidator(passwordRawSchema)]}
					{...commonInputProps}
					isLogin={true}
				/>
				<div>
					<Link className={styles.forgotPassword} href="/forgot-password">
						Forgot password?
					</Link>
				</div>

				<Button
					className={styles.submitButton}
					aria-label="Submit form"
					isLoading={isSubmitting}
					loaderBorderWidth={3}
					loaderColor="#121212"
					loaderSize={16}
					loadingText="Loading..."
					type="submit">
					Login
				</Button>

				<p className={styles.signupText}>
					Don&apos;t have an account?{' '}
					<Link className={styles.signupLink} href="/signup">
						Sign up
					</Link>
				</p>
			</form>

			<FooterOutside />
		</div>
	);
};

export default LoginPageClient;
