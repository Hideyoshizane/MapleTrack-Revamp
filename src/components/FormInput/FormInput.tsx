'use client';

import React, { useState, useEffect, useCallback, InputHTMLAttributes, useRef } from 'react';
import { FieldError, UseFormRegisterReturn, UseFormSetError, UseFormClearErrors } from 'react-hook-form';
import clsx from 'clsx';

import type { FormData } from '@/sharedTypes/form';
import Tooltip from '../Tooltip/Tooltip';

import InfoIcon from '@assets/svg/info.svg';
import OkIcon from '@assets/svg/circle-check.svg';
import ErrorIcon from '@assets/svg/circle-x.svg';

import styles from './FormInput.module.css';

type FormInputProps = {
	label: string;
	id: keyof FormData;
	error?: FieldError;
	register: UseFormRegisterReturn;
	validation?: (value: string) => { isValid: boolean; error?: string };
	setError?: UseFormSetError<FormData>;
	clearErrors?: UseFormClearErrors<FormData>;
	isSubmitted?: boolean;
} & InputHTMLAttributes<HTMLInputElement>;

export default function FormInput({
	label,
	id,
	type = 'text',
	error,
	register,
	validation,
	setError,
	clearErrors,
	isSubmitted = false,
	...rest
}: FormInputProps) {
	const [touched, setTouched] = useState(false);
	const [inputValue, setInputValue] = useState<string>((rest.value as string) ?? (rest.defaultValue as string) ?? '');
	const [isLocallyValid, setIsLocallyValid] = useState<boolean | null>(null);
	const [localErrorMessage, setLocalErrorMessage] = useState<string | null>(null);

	// Track previous validation results to avoid unnecessary state updates
	const prevValidationResult = useRef<{ isValid: boolean | null; error: string | null }>({
		isValid: null,
		error: null,
	});

	// Track previous submission state to prevent redundant validations
	const prevIsSubmitted = useRef(false);

	// Destructure built-in React Hook Form events, spreading the rest into <input>
	const { onBlur: rhfOnBlur, onChange: rhfOnChange, ...registerRest } = register;

	//Validates the input value and updates internal state and optionally sets or clears RHF errors.
	const runValidation = useCallback(
		(value: string) => {
			if (!validation) return;

			try {
				const result = validation(value);

				const hasChanged =
					result.isValid !== prevValidationResult.current.isValid ||
					result.error !== prevValidationResult.current.error;

				if (!hasChanged) return;

				prevValidationResult.current = {
					isValid: result.isValid,
					error: result.error ?? null,
				};

				if (!result.isValid) {
					setIsLocallyValid(false);
					setLocalErrorMessage(result.error ?? 'Invalid input');
					setError?.(id, {
						type: 'manual',
						message: result.error ?? 'Invalid input',
					});
				} else {
					setIsLocallyValid(true);
					setLocalErrorMessage(null);
					clearErrors?.(id);
				}
			} catch (e) {
				console.error('[FormInput] validation threw:', e);

				prevValidationResult.current = {
					isValid: false,
					error: 'Unexpected validation error',
				};

				setIsLocallyValid(false);
				setLocalErrorMessage('Unexpected validation error');
				setError?.(id, {
					type: 'manual',
					message: 'Unexpected validation error',
				});
			}
		},
		[validation, id, setError, clearErrors]
	);

	// Run validation once on mount if initial value exists
	useEffect(() => {
		if (inputValue) {
			setTouched(true);
			runValidation(inputValue);
		}
		// Only run once on mount
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	// Re-run validation only on first form submission
	useEffect(() => {
		if (isSubmitted && !prevIsSubmitted.current) {
			setTouched(true);
			runValidation(inputValue);
		}
		prevIsSubmitted.current = isSubmitted;
	}, [isSubmitted, inputValue, runValidation]);

	// Handle blur: mark as touched and validate
	const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
		setTouched(true);
		runValidation(e.target.value);
		rhfOnBlur?.(e);
	};

	// Handle change: mark as touched, update state, validate
	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		if (!touched) setTouched(true);
		const newValue = e.target.value;
		setInputValue(newValue);
		runValidation(newValue);
		rhfOnChange?.(e);
	};

	// Flags to control rendering of validation status
	const showError = Boolean(error) || localErrorMessage !== null;
	const showValid = touched && !error && isLocallyValid === true;
	const showInvalid = touched && (Boolean(error) || isLocallyValid === false);

	const tooltipMessage =
		showError || isLocallyValid === false
			? localErrorMessage ?? error?.message ?? 'Invalid input'
			: rest.title ?? 'Enter a value';

	const iconSize = 24;

	const inputClass = clsx(styles.input, {
		[styles.valid]: showValid,
		[styles.invalid]: showInvalid,
	});

	// Conditionally render icons with tooltip
	const IconComponent = showValid ? (
		<OkIcon width={iconSize} height={iconSize} className={styles.validIcon} />
	) : (
		<Tooltip content={tooltipMessage} placement="right">
			{showInvalid ? (
				<ErrorIcon width={iconSize} height={iconSize} className={styles.invalidIcon} />
			) : (
				<InfoIcon width={iconSize} height={iconSize} className={styles.defaultIcon} />
			)}
		</Tooltip>
	);

	return (
		<div className={styles.container}>
			<label htmlFor={id} className={styles.label} />
			<div className={styles.inputRow}>
				<input
					id={id}
					type={type}
					aria-invalid={showError}
					aria-describedby={showError ? `${String(id)}-error` : undefined}
					className={inputClass}
					placeholder={label}
					value={inputValue}
					onBlur={handleBlur}
					onChange={handleChange}
					{...rest}
					{...registerRest}
				/>

				<div className={styles.icon}>{IconComponent}</div>
			</div>
		</div>
	);
}
