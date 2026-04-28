'use client';

import { clsx } from 'clsx';
import { useState } from 'react';
import { Controller, type Control, type Path, type FieldValues } from 'react-hook-form';

import styles from './formInput.module.scss';
import ValidationIcon from './ValidationIcon/validationIcon';

import type { ValidationResult } from '@utils/validateField';
import type { HTMLInputTypeAttribute, JSX } from 'react';

type FormInputProps<TFieldValues extends FieldValues> = {
	id: Path<TFieldValues>;
	label: string;
	type: HTMLInputTypeAttribute;
	control: Control<TFieldValues>;
	validation?: (value: string) => ValidationResult;
	isLogin?: boolean;
	isLightmode?: boolean;
};

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

	const containerClass: string = clsx(styles.inputContainer, { [styles.marginSignUp]: !isLogin });

	return (
		<Controller
			control={control}
			name={id}
			render={({ field, fieldState }): JSX.Element => {
				const showError = Boolean(fieldState.error);
				const showValid = touched && !fieldState.error;
				const showInvalid = touched && showError;
				const tooltipMessage = showError ? (fieldState.error?.message ?? 'Invalid input') : 'Enter a value';

				const inputClass = clsx(styles.input, {
					[styles.valid]: !isLogin && showValid,
					[styles.invalid]: !isLogin && showInvalid,
					[styles.lightModeInput]: isLightmode,
				});

				return (
					<div className={containerClass}>
						<div className={styles.inputRow}>
							<input
								className={inputClass}
								aria-describedby={!isLogin && showError ? `${String(id)}-error` : undefined}
								aria-invalid={!isLogin && showError}
								id={id}
								placeholder={label}
								type={type}
								{...field}
								onBlur={(): void => {
									setTouched(true);
									field.onBlur();
								}}
								value={field.value ?? ''}
							/>

							{!isLogin && (
								<div className={styles.icon}>
									<ValidationIcon
										isLightmode={isLightmode}
										showInvalid={showInvalid}
										showTooltip
										showValid={showValid}
										tooltipMessage={tooltipMessage}
									/>
								</div>
							)}
						</div>
					</div>
				);
			}}
			rules={{
				validate: (value: string): boolean | string => {
					if (!validation) {
						return true;
					}
					const result = validation(value);
					return result.isValid || result.error || 'Invalid input';
				},
			}}
		/>
	);
};

export default FormInput;
