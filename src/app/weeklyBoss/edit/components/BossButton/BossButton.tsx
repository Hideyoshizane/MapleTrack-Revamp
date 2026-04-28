import { clsx } from 'clsx';

import BanIcon from '@assets/svg/ban.svg';
import CheckedIcon from '@assets/svg/check-boss.svg';
import ResponsiveText from '@components/ResponsiveText/responsiveText';
import Tooltip from '@components/Tooltip/tooltip';

import styles from './bossButton.module.scss';

import type { JSX } from 'react';

type Difficulty = {
	minLevel: number;
	name: string;
	reset: string;
	value: number;
};

const DIFFICULTY_CLASS_MAP: Record<string, string> = {
	Easy: styles.easy,
	Normal: styles.normal,
	Hard: styles.hard,
	Chaos: styles.chaos,
	Extreme: styles.extreme,
};

const DIFFICULTY_ICON_CLASS_MAP: Record<string, string> = {
	Easy: styles.iconEasy,
	Normal: styles.iconNormal,
	Hard: styles.iconHard,
	Chaos: styles.iconChaos,
	Extreme: styles.iconExtreme,
};

type BossButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
	selected: boolean;
	characterLevel: number;
	isSmallButtons: boolean;
	difficulty: Difficulty;

	onSelect: () => void;
};

const BossButton = ({
	selected,
	characterLevel,
	isSmallButtons,
	difficulty,
	onSelect,
}: BossButtonProps): JSX.Element => {
	const difficultyClass = DIFFICULTY_CLASS_MAP[difficulty.name] ?? '';
	const iconColor = DIFFICULTY_ICON_CLASS_MAP[difficulty.name] ?? '';

	const sizeClass = isSmallButtons ? styles.smallButton : styles.bigButton;
	const minTextSize = isSmallButtons ? 12 : 16;
	const widthSize = isSmallButtons ? 45 : 60;
	const iconSize = isSmallButtons ? 16 : 24;

	const locked = characterLevel < difficulty.minLevel;
	const content = `Required Level: ${difficulty.minLevel}`;

	return (
		<Tooltip content={content} enabled={locked}>
			<button className={clsx(styles.button, difficultyClass, sizeClass)} disabled={locked} onClick={onSelect}>
				<div className={styles.content}>
					{locked ? (
						<BanIcon className={styles.banIcon} height={24} width={24} />
					) : (
						<ResponsiveText
							className={clsx(styles.buttonText, selected && styles.textShift)}
							height={40}
							maxFontSize={minTextSize}
							minFontSize={minTextSize}
							width={widthSize}>
							{difficulty.name}
						</ResponsiveText>
					)}
					<CheckedIcon
						className={clsx(styles.icon, iconColor, selected && !locked && styles.iconVisible)}
						height={iconSize}
						width={iconSize}
					/>
				</div>
			</button>
		</Tooltip>
	);
};

export default BossButton;
