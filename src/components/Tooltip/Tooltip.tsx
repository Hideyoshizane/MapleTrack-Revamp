'use client';

import * as RadixTooltip from '@radix-ui/react-tooltip';
import Cookies from 'js-cookie';
import { useEffect, useState } from 'react';

import styles from './Tooltip.module.scss';

import type { ReactElement, ReactNode, JSX } from 'react';

type CustomTooltipProps = {
	content: ReactNode;
	children: ReactElement;
	placement?: 'top' | 'bottom' | 'left' | 'right';
	enabled?: boolean;
};

const Tooltip = ({ content, children, placement = 'top', enabled = true }: CustomTooltipProps): JSX.Element => {
	const [theme, setTheme] = useState<'light' | 'dark'>('light');

	// Read theme cookie
	useEffect((): void => {
		const themeCookie = Cookies.get('theme');
		if (themeCookie === 'dark' || themeCookie === 'light') {
			setTheme(themeCookie);
		}
	}, []);

	// Determine opposite theme
	const oppositeTheme = theme === 'dark' ? 'light' : 'dark';

	// Choose styles based on opposite theme
	const tooltipClass = oppositeTheme === 'dark' ? styles.tooltipDark : styles.tooltipLight;
	const arrowClass = oppositeTheme === 'dark' ? styles.arrowDark : styles.arrowLight;

	// Render children directly if tooltip is disabled
	if (!enabled) return children;

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
};

export default Tooltip;
