'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useForm } from 'react-hook-form';

import LockIcon from '@assets/svg/lock.svg';
import Button from '@components/Button/button';
import FooterOutside from '@components/FooterOutside/footerOutside';
import FormInput from '@components/FormInput/formInput';
import { emailFieldSchema } from '@features/user/schemas/user.schema';
import { zodValidator } from '@utils/validators';

import { useForgotPassword } from './hooks/useForgotPassword';
import styles from './page.module.scss';

import type { ForgotPasswordFormData } from '@sharedTypes/form';
import type { JSX } from 'react';

const ForgotPasswordPage = (): JSX.Element => {
	const {
		control,
		handleSubmit,
		formState: { isSubmitting, isSubmitted },
	} = useForm<ForgotPasswordFormData>({ mode: 'onBlur', defaultValues: { email: '' } });

	const { submitForgotPassword } = useForgotPassword();
	const commonInputProps = { control, isSubmitted, isLogin: false };

	return (
		<div className={styles.container}>
			<Link aria-label="Go to login page" href="/login">
				<div className={styles.logoDiv}>
					<Image
						alt="MapleTrack Logo"
						fill
						priority
						sizes="(max-width: 1024px) 100vw, 880px"
						src="/assets/logo/logo.webp"
					/>
				</div>
			</Link>

			<div className={styles.titleDiv}>
				<LockIcon className={styles.icon} height={32} width={32} />
				<p className={styles.title}>Trouble logging in?</p>
			</div>

			<p className={styles.text}>Enter your email and we&apos;ll send you a link to reset your password.</p>

			<form noValidate onSubmit={(e): undefined => void handleSubmit(submitForgotPassword)(e)}>
				<FormInput<ForgotPasswordFormData>
					id="email"
					label="Email"
					type="email"
					validators={[zodValidator(emailFieldSchema)]}
					{...commonInputProps}
					isLogin
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
					Send Reset Link
				</Button>

				<div className={styles.orDiv}>
					<div className={styles.bar} />
					<div className={styles.textBar}>OR</div>
					<div className={styles.bar} />
				</div>

				<Link className={styles.newAccount} href="/signup" passHref>
					Create new account
				</Link>
			</form>

			<FooterOutside />
		</div>
	);
};

export default ForgotPasswordPage;
