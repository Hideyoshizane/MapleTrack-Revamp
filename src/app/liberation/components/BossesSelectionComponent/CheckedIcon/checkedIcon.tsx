'use client';

import { clsx } from 'clsx';

import CheckIcon from '@assets/svg/check-boss.svg';
import CircleIcon from '@assets/svg/circle-boss.svg';
import CircleX from '@assets/svg/circle-x.svg';
import Tooltip from '@components/Tooltip/Tooltip';

import styles from './CheckedIcon.module.scss';

import type { JSX } from 'react';

type Props = {
	checkedBoss: string | undefined;
	isSkip: boolean;
	isIncluded: boolean;
	disabled: boolean;
	onToggle: () => void;
};

const CheckedIcon = ({ checkedBoss, isSkip, isIncluded, disabled, onToggle }: Props): JSX.Element => {
	const isLocked = checkedBoss !== 'Skip';

	let IconComponent;

	if (isLocked) {
		IconComponent = CheckIcon;
	} else if (isSkip) {
		IconComponent = CircleX;
	} else {
		IconComponent = isIncluded ? CircleIcon : CheckIcon;
	}

	return (
		<Tooltip content="Boss already cleared this week." enabled={isLocked} placement="top">
			<div className={styles.checkDiv}>
				<IconComponent
					className={clsx(styles.checkIcon, (isLocked || isSkip) && styles.cleared)}
					onClick={disabled ? undefined : onToggle}
				/>
			</div>
		</Tooltip>
	);
};

export default CheckedIcon;
