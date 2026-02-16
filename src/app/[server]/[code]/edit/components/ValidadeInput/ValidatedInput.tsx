'use client';

import { clsx } from 'clsx';
import { useState } from 'react';

import Tooltip from '@components/Tooltip/Tooltip';

import styles from './ValidatedInput.module.scss';

import type { JSX } from 'react';

type ValidatedInputProps = {
	value?: string;
	placeholder?: string;
	error?: string | null;
	onBlur?: (value: string) => void;
	onCommit?: (value: string) => void;
};

const ValidatedInputInner = ({
	value = '',
	placeholder,
	error,
	onBlur,
	onCommit,
}: ValidatedInputProps): JSX.Element => {
	const [inputValue, setInputValue] = useState<string>(value);

	const handleChange = (val: string): void => {
		setInputValue(val);
	};

	const handleFocus = (): void => {
		setInputValue('');
	};

	const handleBlur = (): void => {
		const finalValue = inputValue.trim() === '' ? value : inputValue;

		setInputValue(finalValue);

		onBlur?.(finalValue);
		onCommit?.(finalValue);
	};

	return (
		<Tooltip content={error} placement="left" enabled={!!error}>
			<input
				className={clsx(styles.characterName, { [styles.invalid]: !!error })}
				value={inputValue}
				placeholder={placeholder}
				onChange={(e) => handleChange(e.target.value)}
				onFocus={handleFocus}
				onBlur={handleBlur}
			/>
		</Tooltip>
	);
};

const ValidatedInput = (props: ValidatedInputProps): JSX.Element => {
	return <ValidatedInputInner key={props.value} {...props} />;
};

export default ValidatedInput;
