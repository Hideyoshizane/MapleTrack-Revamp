'use client';

import * as SwitchPrimitive from '@radix-ui/react-switch';

import Tooltip from '@components/Tooltip/tooltip';

import styles from './switch.module.scss';

import type { JSX } from 'react';

type Props = {
	title?: string;
	checked: boolean;
	tooltipMessage?: string;
	onCheckedChange: (checked: boolean) => void;
	disabled?: boolean;
};

const Switch = ({ title, checked, tooltipMessage, onCheckedChange, disabled }: Props): JSX.Element => {
	return (
		<Tooltip content={tooltipMessage} enabled={!!tooltipMessage} placement="bottom">
			<div className={styles.wrapper}>
				{title && <div className={styles.title}>{title}</div>}

				<SwitchPrimitive.Root
					className={styles.root}
					checked={checked}
					disabled={disabled}
					onCheckedChange={onCheckedChange}>
					<SwitchPrimitive.Thumb className={styles.thumb} />
				</SwitchPrimitive.Root>
			</div>
		</Tooltip>
	);
};

export default Switch;
