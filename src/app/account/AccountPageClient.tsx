'use client';

import React from 'react';
import { useForm } from 'react-hook-form';

import Button from '@components/Button/Button';
import FormInput from '@components/FormInput/FormInput';
import { validatePassword, validatePasswordConfirmation } from '@utils/validation';

import AlertDialogComponent from './Components/AlertDialogComponent/AlertDialogComponent';
import { useChangePassword } from './hooks/useChangePassword';
import { useDeleteAccount } from './hooks/useDeleteAccount';
import styles from './page.module.scss';

import type { ChangePasswordFormData } from '@sharedTypes/form';
import type { ValidationResult } from '@utils/validation';
import type { JSX } from 'react';

interface AccountClientProps {
	searchParams?: Record<string, string | undefined>;
	username: string;
}

const AccountPageClient = ({ username }: AccountClientProps): JSX.Element => {
	const {
		control,
		handleSubmit,
		formState: { isSubmitting, isSubmitted },
		getValues,
		setError,
		watch,
	} = useForm<ChangePasswordFormData>({
		mode: 'onBlur',
		defaultValues: {
			currentPassword: '',
			newPassword: '',
			confirmPassword: '',
		},
	});

	const { onSubmit } = useChangePassword({ username, setError });
	const { isDeleteDialogOpen, openDeleteDialog, closeDeleteDialog, handleDelete } = useDeleteAccount({ username });
	const commonInputProps = { control, isSubmitted, isLightmode: true };

	const handleFormSubmit = handleSubmit(onSubmit);

	const newPassword = watch('newPassword');
	const confirmPassword = watch('confirmPassword');

	const newPasswordValid = validatePassword(newPassword).isValid;
	const confirmPasswordValid = validatePasswordConfirmation(newPassword, confirmPassword).isValid;

	const isSubmitDisabled = isSubmitting || !newPasswordValid || !confirmPasswordValid;

	return (
		<section className="mainContent">
			<p className={styles.title}>Account Settings</p>
			<p className={styles.subTitle}>Change Password</p>

			<form
				onSubmit={(e): void => {
					void handleFormSubmit(e);
				}}
				noValidate>
				<div className={styles.firstInput}>
					<FormInput<ChangePasswordFormData>
						id="currentPassword"
						label="Old password"
						type="password"
						validation={validatePassword}
						{...commonInputProps}
						isLogin={true}
					/>
				</div>

				<FormInput<ChangePasswordFormData>
					id="newPassword"
					label="New password"
					type="password"
					validation={validatePassword}
					{...commonInputProps}
					isLightmode={true}
				/>
				<FormInput<ChangePasswordFormData>
					id="confirmPassword"
					label="Confirm password"
					type="password"
					validation={(value): ValidationResult => validatePasswordConfirmation(getValues('newPassword'), value)}
					{...commonInputProps}
					isLightmode={true}
				/>

				<Button
					type="submit"
					className={styles.submitButton}
					isLoading={isSubmitting}
					loadingText="Submitting..."
					loaderSize={16}
					loaderColor="#121212"
					loaderBorderWidth={3}
					aria-label="Submit form"
					disabled={isSubmitDisabled}>
					Change Password
				</Button>
			</form>

			<p className={styles.dangerText}>Danger Zone</p>

			<>
				<Button onClick={openDeleteDialog} className={styles.dangerButton}>
					Delete Account
				</Button>
				<AlertDialogComponent open={isDeleteDialogOpen} onOpenChange={closeDeleteDialog} onConfirm={handleDelete} />
			</>
		</section>
	);
};

export default AccountPageClient;
