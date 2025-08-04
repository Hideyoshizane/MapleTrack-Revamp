import { clsx } from 'clsx';
import React from 'react';

import Loader from '@components/Loader/Loader';

import styles from './Button.module.css';

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
	isLoading?: boolean;
	loadingText?: string;
	loaderSize?: number;
	loaderColor?: string;
	loaderBorderWidth?: number;
};

export default function Button({
	className = '',
	isLoading = false,
	loadingText = 'Loading...',
	loaderSize = 16,
	loaderColor = '#fff',
	loaderBorderWidth = 5,
	children,
	disabled,
	...props
}: ButtonProps) {
	return (
		<button className={clsx(styles.button, className)} disabled={isLoading || disabled} {...props}>
			{isLoading && (
				<span className={styles.loaderWrapper}>
					<Loader width={loaderSize} height={loaderSize} color={loaderColor} borderWidth={loaderBorderWidth} />
				</span>
			)}
			<span className={styles.buttonText}>{isLoading ? loadingText : children}</span>
		</button>
	);
}
