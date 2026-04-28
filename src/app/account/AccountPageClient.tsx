'use client';

import { useForm, useWatch } from 'react-hook-form';

import Button from '@components/Button/button';
import FormInput from '@components/FormInput/formInput';
import { validatePassword, validatePasswordConfirmation } from '@utils/validators';

import AlertDialogComponent from './Components/AlertDialogComponent/alertDialogComponent';
import { useChangePassword } from './hooks/useChangePassword';
import { useDeleteAccount } from './hooks/useDeleteAccount';
import styles from './page.module.scss';

import type { ChangePasswordFormData } from '@sharedTypes/form';
import type { ValidationResult } from '@utils/validateField';
import type { JSX } from 'react';

const AccountPageClient = (): JSX.Element => {
	const {
		control,
		handleSubmit,
		formState: { isSubmitting, isSubmitted },
		getValues,
		setError,
	} = useForm<ChangePasswordFormData>({
		mode: 'onBlur',
		defaultValues: { currentPassword: '', newPassword: '', confirmPassword: '' },
	});

	const { onSubmit } = useChangePassword({ setError });
	const { isDeleteDialogOpen, openDeleteDialog, closeDeleteDialog, handleDelete } = useDeleteAccount();

	const commonInputProps = { control, isSubmitted, isLightmode: true };

	const handleFormSubmit = handleSubmit(onSubmit);

	const newPassword: string = useWatch({ control, name: 'newPassword' });

	const confirmPassword: string = useWatch({ control, name: 'confirmPassword' });

	const isSubmitDisabled =
		isSubmitting ||
		!validatePassword(newPassword).isValid ||
		!validatePasswordConfirmation(newPassword, confirmPassword).isValid;

	return (
		<section className="mainContent">
			<p className={styles.title}>Account Settings</p>
			<p className={styles.subTitle}>Change Password</p>

			<form
				noValidate
				onSubmit={(e): void => {
					void handleFormSubmit(e);
				}}>
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
					className={styles.submitButton}
					aria-label="Submit form"
					disabled={isSubmitDisabled}
					isLoading={isSubmitting}
					loaderBorderWidth={3}
					loaderColor="#121212"
					loaderSize={16}
					loadingText="Submitting..."
					type="submit">
					Change Password
				</Button>
			</form>

			<p className={styles.dangerText}>Danger Zone</p>

			<Button className={styles.dangerButton} onClick={openDeleteDialog}>
				Delete Account
			</Button>
			<AlertDialogComponent onConfirm={handleDelete} onOpenChange={closeDeleteDialog} open={isDeleteDialogOpen} />
		</section>
	);
};

export default AccountPageClient;
