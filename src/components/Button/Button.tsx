import { clsx } from 'clsx';
import React from 'react';

import Loader from '@components/Loader/Loader';

import styles from './Button.module.scss';

import type { JSX } from 'react';

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
	...props
}: ButtonProps): JSX.Element => {
	return (
		<button className={clsx(styles.button, className)} disabled={isLoading || disabled} {...props}>
			{isLoading && (
				<Loader width={loaderSize} height={loaderSize} color={loaderColor} borderWidth={loaderBorderWidth} />
			)}
			<span className={styles.buttonText}>{isLoading ? loadingText : children}</span>
		</button>
	);
};

export default Button;
