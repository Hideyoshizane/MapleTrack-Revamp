import React from 'react';
import styles from './Button.module.css';

import clsx from 'clsx';

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement>;

export default function Button({ className = '', ...props }: ButtonProps) {
	return <button className={clsx(styles.button, className)} {...props} />;
}
