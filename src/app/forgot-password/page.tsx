'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useForm } from 'react-hook-form';

import LockIcon from '@assets/svg/lock.svg';
import Button from '@components/Button/Button';
import FooterOutside from '@components/FooterOutside/FooterOutside';
import FormInput from '@components/FormInput/FormInput';
import { validateEmail } from '@utils/validators';

import { useForgotPassword } from './hooks/useForgotPassword';
import styles from './page.module.scss';

import type { ForgotPasswordFormData } from '@sharedTypes/form';
import type { JSX } from 'react';

const ForgotPasswordPage = (): JSX.Element => {
	const {
		control,
		handleSubmit,
		formState: { isSubmitting, isSubmitted },
		setError,
	} = useForm<ForgotPasswordFormData>({ mode: 'onBlur', defaultValues: { email: '' } });

	const { submitForgotPassword } = useForgotPassword(setError);
	const commonInputProps = { control, isSubmitted, isLogin: false };

	return (
		<div className={styles.container}>
			<Link href="/login" aria-label="Go to login page">
				<div className={styles.logoDiv}>
					<Image
						src="/assets/logo/logo.webp"
						priority
						fill
						sizes="(max-width: 1024px) 100vw, 880px"
						alt="MapleTrack Logo"
					/>
				</div>
			</Link>

			<div className={styles.titleDiv}>
				<LockIcon width={32} height={32} className={styles.icon} />
				<p className={styles.title}>Trouble logging in?</p>
			</div>

			<p className={styles.text}>Enter your email and we&apos;ll send you a link to reset your password.</p>

			<form onSubmit={(e): undefined => void handleSubmit(submitForgotPassword)(e)} noValidate>
				<FormInput<ForgotPasswordFormData>
					id="email"
					label="Email"
					type="email"
					validation={validateEmail}
					{...commonInputProps}
					isLogin
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
					Send Reset Link
				</Button>

				<div className={styles.orDiv}>
					<div className={styles.bar} />
					<div className={styles.textBar}>OR</div>
					<div className={styles.bar} />
				</div>

				<Link href="/signup" passHref className={styles.newAccount}>
					Create new account
				</Link>
			</form>

			<FooterOutside />
		</div>
	);
};

export default ForgotPasswordPage;
