'use client';

import * as RadixTooltip from '@radix-ui/react-tooltip';

import { useTheme } from '@context/useTheme';

import styles from './Tooltip.module.scss';

import type { ReactElement, ReactNode, JSX } from 'react';

type CustomTooltipProps = {
	content: ReactNode;
	children: ReactElement;
	placement?: 'top' | 'bottom' | 'left' | 'right';
	enabled?: boolean;
};

const Tooltip = ({ content, children, placement = 'top', enabled = true }: CustomTooltipProps): JSX.Element => {
	const { theme } = useTheme();

	// Tooltip uses the opposite theme for contrast
	const oppositeTheme = theme === 'dark' ? 'light' : 'dark';

	const tooltipClass = oppositeTheme === 'dark' ? styles.tooltipDark : styles.tooltipLight;
	const arrowClass = oppositeTheme === 'dark' ? styles.arrowDark : styles.arrowLight;

	if (!enabled) {
		return children;
	}

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
