'use client';

import * as SwitchPrimitive from '@radix-ui/react-switch';

import Tooltip from '@components/Tooltip/tooltip';

import styles from './switch.module.scss';

import type { JSX } from 'react';

type SwitchProps = {
	title?: string;
	checked: boolean;
	tooltipMessage?: string;
	onCheckedChange: (checked: boolean) => void;
	disabled?: boolean;
};

const Switch = ({ title, checked, tooltipMessage, onCheckedChange, disabled }: SwitchProps): JSX.Element => {
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
