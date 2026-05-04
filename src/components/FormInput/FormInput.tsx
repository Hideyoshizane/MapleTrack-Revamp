'use client';

import { clsx } from 'clsx';
import { useState } from 'react';
import { Controller, type Control, type FieldValues, type Path } from 'react-hook-form';

import styles from './formInput.module.scss';
import ValidationIcon from './ValidationIcon/validationIcon';

import type { Validator } from '@utils/validateField';
import type { HTMLInputTypeAttribute, JSX } from 'react';

type Props<TFieldValues extends FieldValues> = {
	id: Path<TFieldValues>;
	label: string;
	type: HTMLInputTypeAttribute;
	control: Control<TFieldValues>;
	validators?: Validator[];
	isLogin?: boolean;
	isLightmode?: boolean;
};

const FormInput = <TFieldValues extends FieldValues>({
	id,
	label,
	type,
	control,
	validators,
	isLogin = false,
	isLightmode = false,
}: Props<TFieldValues>): JSX.Element => {
	const [touched, setTouched] = useState(false);

	const containerClass = clsx(styles.inputContainer, { [styles.marginSignUp]: !isLogin });

	return (
		<Controller
			control={control}
			name={id}
			render={({ field }): JSX.Element => {
				const value = field.value ?? '';

				const errors = validators?.map((v) => v(value)).filter((e): e is string => Boolean(e)) ?? [];

				const errorMessage = errors.length > 0 ? errors.join('\n') : undefined;

				const showError = Boolean(errorMessage);
				const showValid = touched && !showError;
				const showInvalid = touched && showError;

				const tooltipMessage = showError ? (errorMessage ?? 'Invalid input') : 'Enter a value';

				const inputClass = clsx(styles.input, {
					[styles.valid]: !isLogin && showValid,
					[styles.invalid]: !isLogin && showInvalid,
					[styles.lightModeInput]: isLightmode,
				});

				return (
					<div className={containerClass}>
						<div className={styles.inputRow}>
							<input
								{...field}
								className={inputClass}
								aria-describedby={!isLogin && showError ? `${String(id)}-error` : undefined}
								aria-invalid={!isLogin && showError}
								id={id}
								onBlur={(): void => {
									setTouched(true);
									field.onBlur();
								}}
								placeholder={label}
								type={type}
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
		/>
	);
};

export default FormInput;
