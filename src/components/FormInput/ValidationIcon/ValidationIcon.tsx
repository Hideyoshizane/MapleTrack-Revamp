'use client';

import { clsx } from 'clsx';
import React from 'react';

import OkIcon from '@assets/svg/circle-check.svg';
import ErrorIcon from '@assets/svg/circle-x.svg';
import InfoIcon from '@assets/svg/info.svg';
import Tooltip from '@components/Tooltip/Tooltip';

import styles from './ValidationIcon.module.scss';

import type { JSX } from 'react';

type ValidationIconProps = {
	showValid: boolean; // Show green check icon
	showInvalid: boolean; // Show red error icon
	tooltipMessage: string;
	showTooltip: boolean;
	iconSize?: number;
	className?: string;
	isLightmode?: boolean;
};

const ValidationIcon: React.FC<ValidationIconProps> = ({
	showValid,
	showInvalid,
	tooltipMessage,
	showTooltip = true,
	iconSize = 24,
	className,
	isLightmode = false,
}): JSX.Element => {
	// Show green check without tooltip
	if (showValid) {
		return <OkIcon width={iconSize} height={iconSize} className={clsx(styles.validIcon, className)} />;
	}

	// Determine which icon to render
	const IconComponent: React.ElementType = showInvalid ? ErrorIcon : InfoIcon;
	const iconClass = clsx(
		showInvalid ? styles.invalidIcon : styles.defaultIcon,
		!showInvalid && isLightmode && styles.lightModeDefaultIcon,
		className
	);

	return (
		<Tooltip content={tooltipMessage} placement="right" enabled={showTooltip}>
			<IconComponent width={iconSize} height={iconSize} className={iconClass} />
		</Tooltip>
	);
};

export default ValidationIcon;
