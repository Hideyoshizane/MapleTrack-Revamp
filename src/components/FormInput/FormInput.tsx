'use client';

import { clsx } from 'clsx';
import { useState, useMemo } from 'react';
import { Controller, type Control, type Path, type FieldValues } from 'react-hook-form';

import styles from './FormInput.module.scss';
import ValidationIcon from './ValidationIcon/ValidationIcon';

import type { ValidationResult } from '@utils/validation';
import type { HTMLInputTypeAttribute, JSX } from 'react';

interface FormInputProps<TFieldValues extends FieldValues> {
	id: Path<TFieldValues>;
	label: string;
	type: HTMLInputTypeAttribute;
	control: Control<TFieldValues>;
	validation?: (value: string) => ValidationResult;
	isLogin?: boolean;
	isLightmode?: boolean;
}

const FormInput = <TFieldValues extends FieldValues>({
	id,
	label,
	type,
	control,
	validation,
	isLogin = false,
	isLightmode = false,
}: FormInputProps<TFieldValues>): JSX.Element => {
	const [touched, setTouched] = useState(false);

	// Compute container & input styles
	const containerClass = useMemo(
		(): string => clsx(styles.inputContainer, { [styles.marginSignUp]: !isLogin }),
		[isLogin]
	);

	return (
		<Controller
			name={id}
			control={control}
			rules={{
				validate: (value: string): boolean | string => {
					if (!validation) return true;
					const result = validation(value);
					return result.isValid || result.error || 'Invalid input';
				},
			}}
			render={({ field, fieldState }): JSX.Element => {
				const showError = Boolean(fieldState.error);
				const showValid = touched && !fieldState.error;
				const showInvalid = touched && showError;
				const tooltipMessage = showError ? fieldState.error?.message ?? 'Invalid input' : 'Enter a value';

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
								{...field}
								value={field.value ?? ''}
								onBlur={(): void => {
									setTouched(true);
									field.onBlur();
								}}
							/>

							{!isLogin && (
								<div className={styles.icon}>
									<ValidationIcon
										showValid={showValid}
										showInvalid={showInvalid}
										tooltipMessage={tooltipMessage}
										isLightmode={isLightmode}
										showTooltip
									/>
								</div>
							)}
						</div>
					</div>
				);
			}}
		/>
	);
};

export default FormInput;
