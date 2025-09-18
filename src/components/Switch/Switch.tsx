'use client';

import * as SwitchPrimitive from '@radix-ui/react-switch';
import React from 'react';

import Tooltip from '@components/Tooltip/Tooltip';

import styles from './Switch.module.css';

export interface SwitchProps {
	title?: string;
	checked: boolean;
	tooltipMessage?: string;
	onCheckedChange: (checked: boolean) => void;
	disabled?: boolean;
}

const Switch: React.FC<SwitchProps> = ({ title, checked, tooltipMessage, onCheckedChange, disabled }) => {
	return (
		<Tooltip content={tooltipMessage} placement="bottom" enabled={!!tooltipMessage}>
			<div className={styles.wrapper}>
				{title && <div className={styles.title}>{title}</div>}
				<SwitchPrimitive.Root
					className={styles.root}
					checked={checked}
					onCheckedChange={onCheckedChange}
					disabled={disabled}>
					<SwitchPrimitive.Thumb className={styles.thumb} />
				</SwitchPrimitive.Root>
			</div>
		</Tooltip>
	);
};

export default Switch;
