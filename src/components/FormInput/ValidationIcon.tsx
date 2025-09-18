'use client';

import { clsx } from 'clsx';
import React from 'react';

import OkIcon from '@assets/svg/circle-check.svg';
import ErrorIcon from '@assets/svg/circle-x.svg';
import InfoIcon from '@assets/svg/info.svg';
import Tooltip from '@components/Tooltip/Tooltip';

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

	showTooltip: boolean;
};

export default function ValidationIcon({
	showValid,
	showInvalid,
	tooltipMessage,
	iconSize = 24,
	className,
	isLightmode = false,
	showTooltip = true,
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

	// Show green check without tooltip
	if (showValid) {
		return <OkIcon width={iconSize} height={iconSize} className={validClass} />;
	}

	// Determine which icon to render
	const IconComponent = (showInvalid ? ErrorIcon : InfoIcon) as React.ElementType;
	const iconClass = showInvalid ? invalidClass : defaultClass;

	return (
		<Tooltip content={tooltipMessage} placement="right" enabled={showTooltip}>
			<IconComponent width={iconSize} height={iconSize} className={iconClass} />
		</Tooltip>
	);
}
