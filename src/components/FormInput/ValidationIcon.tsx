'use client';

import React from 'react';

import OkIcon from '@assets/svg/circle-check.svg';
import ErrorIcon from '@assets/svg/circle-x.svg';
import InfoIcon from '@assets/svg/info.svg';

import Tooltip from '../Tooltip/Tooltip';

import styles from './FormInput.module.css';

type ValidationIconProps = {
	// Show green check icon
	showValid: boolean;

	// Show red error icon
	showInvalid: boolean;

	// Tooltip message to show on hover
	tooltipMessage: string;

	iconSize?: number;

	className?: string;
};

export default function ValidationIcon({
	showValid,
	showInvalid,
	tooltipMessage,
	iconSize = 24,
	className,
}: ValidationIconProps) {
	if (showValid) {
		return <OkIcon width={iconSize} height={iconSize} className={`${styles.validIcon} ${className ?? ''}`} />;
	}

	return (
		<Tooltip content={tooltipMessage} placement="right">
			{showInvalid ? (
				<ErrorIcon width={iconSize} height={iconSize} className={`${styles.invalidIcon} ${className ?? ''}`} />
			) : (
				<InfoIcon width={iconSize} height={iconSize} className={`${styles.defaultIcon} ${className ?? ''}`} />
			)}
		</Tooltip>
	);
}
