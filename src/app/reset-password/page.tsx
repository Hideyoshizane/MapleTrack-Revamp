'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

import Button from '@components/Button/button';
import FooterOutside from '@components/FooterOutside/footerOutside';
import FormInput from '@components/FormInput/formInput';
import { validatePassword, validatePasswordConfirmation } from '@utils/validators';

import { useResetPassword } from './hooks/useResetPassword';
import styles from './page.module.scss';

import type { ResetPasswordFormData } from '@sharedTypes/form';
import type { ValidationResult } from '@utils/validateField';
import type { JSX } from 'react';

const ResetPasswordPage = (): JSX.Element => {
	const searchParams = useSearchParams();
	const token = searchParams.get('token') ?? '';
	const { control, handleSubmit, isSubmitting, isSubmitted, getValues, onSubmit } = useResetPassword(token);

	const commonInputProps = { control, isSubmitted };

	return (
		<div className={styles.container}>
			<Link href="/login" aria-label="Go to login page">
				<div className={styles.logoDiv}>
					<Image src="/assets/logo/logo.webp" priority fill sizes="750px" alt="MapleTrack Logo" />
				</div>
			</Link>

			<h1 className={styles.title}>Create a new password</h1>
			<h1 className={styles.text}>Your new password must be different from previous used password.</h1>

			<form onSubmit={(e): undefined => void handleSubmit(onSubmit)(e)} noValidate>
				<FormInput<ResetPasswordFormData>
					id="password"
					label="Password"
					type="password"
					validation={validatePassword}
					{...commonInputProps}
					isLogin={false}
				/>

				<FormInput<ResetPasswordFormData>
					id="confirmPassword"
					label="Confirm Password"
					type="password"
					validation={(value): ValidationResult => validatePasswordConfirmation(getValues('password'), value)}
					{...commonInputProps}
					isLogin={false}
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
					Reset Password
				</Button>
			</form>

			<FooterOutside />
		</div>
	);
};

export default ResetPasswordPage;
