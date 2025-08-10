'use client';

import { clsx } from 'clsx';
import React from 'react';

import OkIcon from '@assets/svg/circle-check.svg';
import ErrorIcon from '@assets/svg/circle-x.svg';
import InfoIcon from '@assets/svg/info.svg';

import Tooltip from '../Tooltip/Tooltip';

import styles from './ValidationIcon.module.css';

type ValidationIconProps = {
	// Show green check icon
	showValid: boolean;

	// Show red error icon
	showInvalid: boolean;

	// Tooltip message to show on hover
	tooltipMessage: string;

	iconSize?: number;

	className?: string;
	isLightmode?: boolean;
};

export default function ValidationIcon({
	showValid,
	showInvalid,
	tooltipMessage,
	iconSize = 24,
	className,
	isLightmode = false,
}: ValidationIconProps) {
	const validClass = clsx(styles.validIcon, className);

	const invalidClass = clsx(styles.invalidIcon, className);

	const defaultClass = clsx(
		styles.defaultIcon,
		{
			[styles.lightModeDefaultIcon]: isLightmode,
		},
		className
	);

	if (showValid) {
		return <OkIcon width={iconSize} height={iconSize} className={validClass} />;
	}

	return (
		<Tooltip content={tooltipMessage} placement="right">
			{showInvalid ? (
				<ErrorIcon width={iconSize} height={iconSize} className={invalidClass} />
			) : (
				<InfoIcon width={iconSize} height={iconSize} className={defaultClass} />
			)}
		</Tooltip>
	);
}
