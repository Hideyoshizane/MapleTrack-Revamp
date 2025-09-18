'use client';

import { clsx } from 'clsx';
import React, { useState, useEffect, useCallback, useRef } from 'react';

import styles from './FormInput.module.css';
import ValidationIcon from './ValidationIcon';

import type { HTMLInputTypeAttribute } from 'react';
import type {
	Path,
	FieldError,
	UseFormClearErrors,
	UseFormRegisterReturn,
	UseFormSetError,
	FieldValues,
} from 'react-hook-form';

interface FormInputProps<TFieldValues extends FieldValues> {
	id: Path<TFieldValues>;
	label: string;
	type: HTMLInputTypeAttribute;
	register: UseFormRegisterReturn;
	error?: FieldError;
	validation?: (value: string) => { isValid: boolean; error?: string };
	setError: UseFormSetError<TFieldValues>;
	clearErrors: UseFormClearErrors<TFieldValues>;
	isSubmitted: boolean;
	isLogin: boolean;
	defaultValue?: string;
	isLightmode?: boolean;
}

export default function FormInput<TFieldValues extends FieldValues>({
	id,
	label,
	type,
	register,
	error,
	validation,
	setError,
	clearErrors,
	isSubmitted,
	isLogin = false,
	defaultValue,
	isLightmode = false,
}: FormInputProps<TFieldValues>) {
	// Destructure built-in React Hook Form events, spreading the rest into <input>
	const { onBlur: rhfOnBlur, onChange: rhfOnChange, ref, name, ...registerRest } = register;

	const [inputValue, setInputValue] = useState<string>(defaultValue ?? '');
	const [touched, setTouched] = useState(false);
	const [isLocallyValid, setIsLocallyValid] = useState<boolean | null>(null);
	const [localErrorMessage, setLocalErrorMessage] = useState<string | null>(null);

	// Track previous validation results to avoid unnecessary state updates
	const prevValidationResult = useRef<{ isValid: boolean | null; error: string | null }>({
		isValid: null,
		error: null,
	});

	// Track previous submission state to prevent redundant validations
	const prevIsSubmitted = useRef(false);

	//Validates the input value and updates internal state and optionally sets or clears RHF errors.
	const runValidation = useCallback(
		(value: string) => {
			if (!validation) {
				setIsLocallyValid(null);
				setLocalErrorMessage(null);
				return;
			}

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
		void rhfOnBlur?.(e);
	};

	// Handle change: mark as touched, update state, validate
	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		if (!touched) setTouched(true);
		const newValue = e.target.value;
		setInputValue(newValue);
		runValidation(newValue);
		void rhfOnChange?.(e);
	};

	// Flags to control rendering of validation status
	const showError = Boolean(error) || localErrorMessage !== null;
	const showValid = touched && !error && isLocallyValid === true;
	const showInvalid = touched && (Boolean(error) || isLocallyValid === false);

	const tooltipMessage =
		showError || isLocallyValid === false ? localErrorMessage ?? error?.message ?? 'Invalid input' : 'Enter a value';

	// Compute the container class to add margin if is signup
	const containerClass = clsx(styles.inputContainer, {
		[styles.marginSignUp]: !isLogin,
	});

	// Compute the input class to add margin color if needed
	const inputClass = clsx(styles.input, {
		[styles.valid]: !isLogin && showValid,
		[styles.invalid]: !isLogin && showInvalid,
		[styles.lightModeInput]: isLightmode,
	});

	return (
		<div className={containerClass}>
			<div className={styles.inputRow}>
				<input
					id={id}
					type={type}
					aria-invalid={!isLogin && showError}
					aria-describedby={!isLogin && showError ? `${String(id)}-error` : undefined}
					className={inputClass}
					placeholder={label}
					value={inputValue}
					onBlur={handleBlur}
					onChange={handleChange}
					ref={ref}
					name={name}
					{...registerRest}
				/>

				{!isLogin && (
					<div className={styles.icon}>
						<ValidationIcon
							showValid={showValid}
							showInvalid={showInvalid}
							tooltipMessage={tooltipMessage}
							isLightmode={isLightmode}
							showTooltip={!isLogin}
						/>
					</div>
				)}
			</div>
		</div>
	);
}
