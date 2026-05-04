'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

import Button from '@components/Button/button';
import FooterOutside from '@components/FooterOutside/footerOutside';
import FormInput from '@components/FormInput/formInput';
import { passwordFieldSchema } from '@features/user/schemas/user.schema';
import { zodValidator, confirmPasswordValidator } from '@utils/validators';

import { useResetPassword } from './hooks/useResetPassword';
import styles from './page.module.scss';

import type { ResetPasswordFormData } from '@sharedTypes/form';
import type { JSX } from 'react';

const ResetPasswordPage = (): JSX.Element => {
	const searchParams = useSearchParams();
	const token = searchParams.get('token') ?? '';

	const { control, handleSubmit, isSubmitting, isSubmitted, getValues, onSubmit } = useResetPassword(token);

	const commonInputProps = { control, isSubmitted };

	return (
		<div className={styles.container}>
			<Link aria-label="Go to login page" href="/login">
				<div className={styles.logoDiv}>
					<Image alt="MapleTrack Logo" fill priority sizes="750px" src="/assets/logo/logo.webp" />
				</div>
			</Link>

			<h1 className={styles.title}>Create a new password</h1>
			<h1 className={styles.text}>Your new password must be different from previous used password.</h1>

			<form noValidate onSubmit={(e): undefined => void handleSubmit(onSubmit)(e)}>
				<FormInput<ResetPasswordFormData>
					id="password"
					label="Password"
					type="password"
					validators={[zodValidator(passwordFieldSchema)]}
					{...commonInputProps}
					isLogin={false}
				/>

				<FormInput<ResetPasswordFormData>
					id="confirmPassword"
					label="Confirm Password"
					type="password"
					validators={[zodValidator(passwordFieldSchema), confirmPasswordValidator(() => getValues('password'))]}
					{...commonInputProps}
					isLogin={false}
				/>

				<Button
					className={styles.submitButton}
					aria-label="Submit form"
					isLoading={isSubmitting}
					loaderBorderWidth={3}
					loaderColor="#121212"
					loaderSize={16}
					loadingText="Submitting..."
					type="submit">
					Reset Password
				</Button>
			</form>

			<FooterOutside />
		</div>
	);
};

export default ResetPasswordPage;
