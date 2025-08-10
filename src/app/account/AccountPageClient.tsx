'use client';

import { signOut } from 'next-auth/react';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';

import Button from '@components/Button/Button';
import FormInput from '@components/FormInput/FormInput';
import { fetchWithTimeout } from '@utils/fetch/withTimeout';
import { sanitizeInputFrontend } from '@utils/sanitize';
import { validatePassword, validatePasswordConfirmation, handleFieldValidation } from '@utils/validation';

import AlertDialogComponent from './AlertDialogComponent/AlertDialogComponent';
import styles from './page.module.css';

import type { ChangePasswordApiResponse, DeleteAccountApiResponse } from '@sharedTypes/api/auth';
import type { ChangePasswordFormData } from '@sharedTypes/form';
import type { ValidationResult } from '@utils/validation';

interface AccountClientProps {
	searchParams?: Record<string, string | undefined>;
	username: string;
}

export default function AccountPageClient({ username }: AccountClientProps) {
	const {
		register,
		handleSubmit,
		formState: { errors, isSubmitting, isSubmitted },
		setError,
		clearErrors,
		getValues,
	} = useForm<ChangePasswordFormData>({
		mode: 'onBlur', // Validate when field loses focus
	});

	const onSubmit = async (data: ChangePasswordFormData) => {
		try {
			// Sanitize input to avoid XSS
			const currentPassword = sanitizeInputFrontend(data.currentPassword);
			const newPassword = sanitizeInputFrontend(data.newPassword);
			const confirmPassword = sanitizeInputFrontend(data.confirmPassword);

			// Client-side validation
			const validations = {
				currentPassword: validatePassword(currentPassword),
				newPassword: validatePassword(newPassword),
				confirmPassword: validatePasswordConfirmation(newPassword, confirmPassword),
			};

			// If any validation fails, set errors and abort submission
			let hasErrors = false;
			(Object.entries(validations) as [keyof typeof validations, ValidationResult][]).forEach(([field, result]) => {
				const errorFound = handleFieldValidation(field, result, setError);
				if (errorFound) hasErrors = true;
			});
			if (hasErrors) return;

			const payload = {
				username,
				currentPassword,
				newPassword,
			};

			const response = await fetchWithTimeout('/api/auth/change-password', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(payload),
			});

			const result = (await response.json()) as ChangePasswordApiResponse;

			if (response.ok && result.success) {
				toast.success('Password changed successfully.');
			} else if (!result.success) {
				toast.error(result.error || 'Failed to change password');

				if (result.details) {
					for (const [field, msg] of Object.entries(result.details)) {
						setError(field as keyof ChangePasswordFormData, { message: msg ?? 'Invalid input' });
					}
				}
			} else {
				// Fallback safety net (shouldn't normally hit this)
				toast.error('Failed to change password');
			}
		} catch (error: unknown) {
			// Handle fetch errors or aborts gracefully
			if ((error as DOMException).name === 'AbortError') {
				toast.error('Request timed out. Please try again.');
			} else {
				toast.error('Unexpected error occurred');
				console.error('Change password error:', error);
			}
		}
	};

	const [open, setOpen] = useState(false);
	const handleConfirm = async () => {
		try {
			const payload = { username };

			const response = await fetch('/api/account/delete', {
				method: 'DELETE',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify(payload),
			});

			const result = (await response.json()) as DeleteAccountApiResponse;

			if (response.ok && result.success) {
				await signOut({ callbackUrl: '/login?accountDeleted=1' });
				setOpen(false);
			} else if (!result.success) {
				toast.error(result.error || 'Failed to delete account');
			}
		} catch (error: unknown) {
			if (error instanceof Error) {
				toast.error(error.message);
				console.error('Delete account error:', error);
			} else {
				toast.error('Unknown error occurred.');
			}
		}
	};

	return (
		<section className="mainContent">
			<p className={styles.title}>Account Settings</p>
			<p className={styles.subTitle}>Change Password</p>

			<form onSubmit={(e) => void handleSubmit(onSubmit)(e)} noValidate>
				<div className={styles.firstInput}>
					<FormInput<ChangePasswordFormData>
						id="currentPassword"
						label="Old password"
						type="password"
						register={register('currentPassword')}
						error={errors.confirmPassword}
						setError={setError}
						clearErrors={clearErrors}
						isSubmitted={isSubmitted}
						isLogin
						isLightmode={true}
					/>
				</div>

				<FormInput<ChangePasswordFormData>
					id="newPassword"
					label="New password"
					type="password"
					register={register('newPassword')}
					error={errors.confirmPassword}
					validation={(value) => validatePassword(value)}
					setError={setError}
					clearErrors={clearErrors}
					isSubmitted={isSubmitted}
					isLightmode={true}
				/>
				<FormInput<ChangePasswordFormData>
					id="confirmPassword"
					label="Confirm password"
					type="password"
					register={register('confirmPassword')}
					validation={(value) => validatePasswordConfirmation(getValues('newPassword'), value)}
					error={errors.confirmPassword}
					setError={setError}
					clearErrors={clearErrors}
					isSubmitted={isSubmitted}
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
					aria-label="Submit form">
					Sign Up
				</Button>
			</form>

			<p className={styles.dangerText}>Danger Zone</p>

			<>
				<Button onClick={() => setOpen(true)} className={styles.dangerButton}>
					Delete Account
				</Button>
				<AlertDialogComponent open={open} onOpenChange={setOpen} onConfirm={handleConfirm} />
			</>
		</section>
	);
}
