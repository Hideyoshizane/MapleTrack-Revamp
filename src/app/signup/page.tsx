'use client';

import Image from 'next/image';
import Link from 'next/link';

import Button from '@components/Button/Button';
import FooterOutside from '@components/FooterOutside/FooterOutside';
import FormInput from '@components/FormInput/FormInput';
import { usernameFieldSchema, emailFieldSchema, passwordFieldSchema } from '@features/user/schemas/user.schema';
import { zodValidator, confirmPasswordValidator } from '@utils/validators';

import { useSignup } from './hooks/useSignup';
import styles from './Page.module.scss';

import type { SignupFormData } from '@sharedTypes/form';
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
					validators={[zodValidator(usernameFieldSchema)]}
					{...commonInputProps}
				/>

				<FormInput<SignupFormData>
					id="email"
					label="Email"
					type="email"
					validators={[zodValidator(emailFieldSchema)]}
					{...commonInputProps}
				/>

				<FormInput<SignupFormData>
					id="password"
					label="Password"
					type="password"
					validators={[zodValidator(passwordFieldSchema)]}
					{...commonInputProps}
				/>

				<FormInput<SignupFormData>
					id="confirmPassword"
					label="Confirm Password"
					type="password"
					validators={[zodValidator(passwordFieldSchema), confirmPasswordValidator(() => getValues('password'))]}
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
