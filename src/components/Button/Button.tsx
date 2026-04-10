import { clsx } from 'clsx';

import Loader from '@components/Loader/loader';

import styles from './button.module.scss';

import type { JSX, MouseEvent, KeyboardEvent } from 'react';

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
	isLoading?: boolean;
	loadingText?: string;
	loaderSize?: number;
	loaderColor?: string;
	loaderBorderWidth?: number;
};

const Button = ({
	className = '',
	isLoading = false,
	loadingText = 'Loading...',
	loaderSize = 16,
	loaderColor = '#fff',
	loaderBorderWidth = 5,
	children,
	disabled,
	onClick,
	onKeyDown,
	...props
}: ButtonProps): JSX.Element => {
	const isActuallyDisabled = Boolean(isLoading || disabled);

	const handleClick = (event: MouseEvent<HTMLButtonElement>): void => {
		if (isActuallyDisabled) {
			event.preventDefault();
			event.stopPropagation();
			return;
		}

		onClick?.(event);
	};

	const handleKeyDown = (event: KeyboardEvent<HTMLButtonElement>): void => {
		if (isActuallyDisabled && (event.key === 'Enter' || event.key === ' ')) {
			event.preventDefault();
			event.stopPropagation();
			return;
		}

		onKeyDown?.(event);
	};

	return (
		<button
			className={clsx(styles.button, className, {
				[styles.disabled]: isActuallyDisabled,
			})}
			aria-disabled={isActuallyDisabled}
			tabIndex={0}
			onClick={handleClick}
			onKeyDown={handleKeyDown}
			{...props}>
			{isLoading && (
				<Loader width={loaderSize} height={loaderSize} color={loaderColor} borderWidth={loaderBorderWidth} />
			)}
			<span className={styles.buttonText}>{isLoading ? loadingText : children}</span>
		</button>
	);
};

export default Button;
