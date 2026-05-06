'use client';

import { useForm, useWatch } from 'react-hook-form';

import Button from '@components/Button/Button';
import FormInput from '@components/FormInput/FormInput';
import { passwordFieldSchema } from '@features/user/schemas/user.schema';
import { zodValidator, confirmPasswordValidator } from '@utils/validators';

import AlertDialogComponent from './Components/AlertDialogComponent/AlertDialogComponent';
import { useChangePassword } from './hooks/useChangePassword';
import { useDeleteAccount } from './hooks/useDeleteAccount';
import styles from './Page.module.scss';

import type { ChangePasswordFormData } from '@sharedTypes/form';
import type { JSX } from 'react';

const AccountPageClient = (): JSX.Element => {
	const {
		control,
		handleSubmit,
		formState: { isSubmitting, isSubmitted },
		getValues,
	} = useForm<ChangePasswordFormData>({
		mode: 'onBlur',
		defaultValues: { currentPassword: '', newPassword: '', confirmPassword: '' },
	});

	const { onSubmit } = useChangePassword();
	const { isDeleteDialogOpen, openDeleteDialog, closeDeleteDialog, handleDelete } = useDeleteAccount();

	const commonInputProps = { control, isSubmitted, isLightmode: true };

	const newPassword: string = useWatch({ control, name: 'newPassword' });
	const confirmPassword: string = useWatch({ control, name: 'confirmPassword' });

	const isSubmitDisabled = isSubmitting || !newPassword || !confirmPassword;

	return (
		<section className="mainContent">
			<p className={styles.title}>Account Settings</p>
			<p className={styles.subTitle}>Change Password</p>

			<form noValidate onSubmit={(e): void => void handleSubmit(onSubmit)(e)}>
				<div className={styles.firstInput}>
					<FormInput<ChangePasswordFormData>
						id="currentPassword"
						label="Old password"
						type="password"
						validators={[zodValidator(passwordFieldSchema)]}
						{...commonInputProps}
						isLogin={true}
					/>
				</div>

				<FormInput<ChangePasswordFormData>
					id="newPassword"
					label="New password"
					type="password"
					validators={[zodValidator(passwordFieldSchema)]}
					{...commonInputProps}
					isLightmode={true}
				/>
				<FormInput<ChangePasswordFormData>
					id="confirmPassword"
					label="Confirm password"
					type="password"
					validators={[zodValidator(passwordFieldSchema), confirmPasswordValidator(() => getValues('newPassword'))]}
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
