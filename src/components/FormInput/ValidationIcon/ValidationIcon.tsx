'use client';

import { clsx } from 'clsx';

import OkIcon from '@assets/svg/circle-check.svg';
import ErrorIcon from '@assets/svg/circle-x.svg';
import InfoIcon from '@assets/svg/info.svg';
import Tooltip from '@components/Tooltip/tooltip';

import styles from './validationIcon.module.scss';

import type { FC, SVGProps, JSX } from 'react';

const ICONS: Record<'invalid' | 'info', FC<SVGProps<SVGSVGElement>>> = {
	invalid: ErrorIcon as FC<SVGProps<SVGSVGElement>>,
	info: InfoIcon as FC<SVGProps<SVGSVGElement>>,
};

type Props = {
	showValid: boolean;
	showInvalid: boolean;
	tooltipMessage: string;
	showTooltip: boolean;
	iconSize?: number;
	className?: string;
	isLightmode?: boolean;
};

const ValidationIcon = ({
	showValid,
	showInvalid,
	tooltipMessage,
	showTooltip = true,
	iconSize = 24,
	className,
	isLightmode = false,
}: Props): JSX.Element => {
	// Show green check without tooltip
	if (showValid) {
		return <OkIcon className={clsx(styles.validIcon, className)} height={iconSize} width={iconSize} />;
	}

	// Determine which icon to render
	const IconComponent = ICONS[showInvalid ? 'invalid' : 'info'];
	const iconClass = clsx(
		showInvalid ? styles.invalidIcon : styles.defaultIcon,
		!showInvalid && isLightmode && styles.lightModeDefaultIcon,
		className,
	);

	return (
		<Tooltip content={tooltipMessage} enabled={showTooltip} placement="right">
			<IconComponent className={iconClass} height={iconSize} width={iconSize} />
		</Tooltip>
	);
};

export default ValidationIcon;
