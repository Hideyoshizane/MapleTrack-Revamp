'use client';

import * as RadixTooltip from '@radix-ui/react-tooltip';
import React from 'react';
import styles from './Tooltip.module.css';
import Cookies from 'js-cookie';

type CustomTooltipProps = {
	content: React.ReactNode;
	children: React.ReactElement;
	placement?: 'top' | 'bottom' | 'left' | 'right';
};

export default function Tooltip({ content, children, placement = 'top' }: CustomTooltipProps) {
	// Read theme cookie
	const themeCookie = Cookies.get('theme');

	// Validate theme, fallback to 'light' if invalid or undefined
	const theme = themeCookie === 'dark' || themeCookie === 'light' ? themeCookie : 'light';

	// Determine opposite theme
	const oppositeTheme = theme === 'dark' ? 'light' : 'dark';

	// Choose styles based on opposite theme
	const tooltipClass = oppositeTheme === 'dark' ? styles.tooltipDark : styles.tooltipLight;
	const arrowClass = oppositeTheme === 'dark' ? styles.arrowDark : styles.arrowLight;

	return (
		<RadixTooltip.Provider delayDuration={50}>
			<RadixTooltip.Root>
				<RadixTooltip.Trigger asChild>{children}</RadixTooltip.Trigger>

				<RadixTooltip.Portal>
					<RadixTooltip.Content side={placement} sideOffset={5} className={tooltipClass}>
						{content}
						<RadixTooltip.Arrow className={arrowClass} />
					</RadixTooltip.Content>
				</RadixTooltip.Portal>
			</RadixTooltip.Root>
		</RadixTooltip.Provider>
	);
}
