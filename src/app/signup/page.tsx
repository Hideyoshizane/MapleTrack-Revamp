'use client';

import Image from 'next/image';
import Link from 'next/link';

import Button from '@components/Button/button';
import FooterOutside from '@components/FooterOutside/footerOutside';
import FormInput from '@components/FormInput/formInput';
import { validateUsername, validateEmail, validatePassword, validatePasswordConfirmation } from '@utils/validators';

import { useSignup } from './hooks/useSignup';
import styles from './page.module.scss';

import type { SignupFormData } from '@sharedTypes/form';
import type { ValidationResult } from '@utils/validateField';
import type { JSX } from 'react';

const SignupPage = (): JSX.Element => {
	const { control, handleSubmit, isSubmitting, isSubmitted, isValid, getValues, onSubmit } = useSignup();
	const commonInputProps = { control, isSubmitted };

	return (
		<div className={styles.container}>
			<Link aria-label="Go to login page" href="/login">
				<div className={styles.logoDiv}>
					<Image alt="MapleTrack Logo" fill priority sizes="750px" src="/assets/logo/logo.webp" />
				</div>
			</Link>

			<h1 className={styles.title}>Create a new account</h1>

			<form noValidate onSubmit={(e): undefined => void handleSubmit(onSubmit)(e)}>
				<FormInput<SignupFormData>
					id="username"
					label="Username"
					type="text"
					validation={validateUsername}
					{...commonInputProps}
				/>

				<FormInput<SignupFormData>
					id="email"
					label="Email"
					type="email"
					validation={validateEmail}
					{...commonInputProps}
				/>

				<FormInput<SignupFormData>
					id="password"
					label="Password"
					type="password"
					validation={validatePassword}
					{...commonInputProps}
				/>

				<FormInput<SignupFormData>
					id="confirmPassword"
					label="Confirm Password"
					type="password"
					validation={(value): ValidationResult => validatePasswordConfirmation(getValues('password'), value)}
					{...commonInputProps}
				/>

				<Button
					className={styles.submitButton}
					aria-label="Submit form"
					disabled={!isValid || isSubmitting}
					isLoading={isSubmitting}
					loaderBorderWidth={3}
					loaderColor="#121212"
					loaderSize={16}
					loadingText="Submitting..."
					type="submit">
					Sign Up
				</Button>
			</form>

			<FooterOutside />
		</div>
	);
};

export default SignupPage;
