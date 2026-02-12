'use client';

import Image from 'next/image';
import Link from 'next/link';

import Button from '@components/Button/Button';
import FooterOutside from '@components/FooterOutside/FooterOutside';
import FormInput from '@components/FormInput/FormInput';
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
			<Link href="/login" aria-label="Go to login page">
				<div className={styles.logoDiv}>
					<Image src="/assets/logo/logo.webp" priority fill sizes="750px" alt="MapleTrack Logo" />
				</div>
			</Link>

			<h1 className={styles.title}>Create a new account</h1>

			<form onSubmit={(e): undefined => void handleSubmit(onSubmit)(e)} noValidate>
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
					type="submit"
					className={styles.submitButton}
					isLoading={isSubmitting}
					disabled={!isValid || isSubmitting}
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
};

export default SignupPage;
