import { clsx } from 'clsx';

import BanIcon from '@assets/svg/ban.svg';
import CheckedIcon from '@assets/svg/check-boss.svg';
import ResponsiveText from '@components/ResponsiveText/ResponsiveText';
import Tooltip from '@components/Tooltip/Tooltip';

import styles from './BossButton.module.scss';

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

	const sizeClass = isSmallButtons ? styles.smallButton : styles.bigButton;
	const minTextSize = isSmallButtons ? 12 : 16;
	const iconColor = difficulty.name == 'Normal' || difficulty.name == 'Hard' ? styles.black : styles.white;
	const widthSize = isSmallButtons ? 45 : 60;
	const locked = characterLevel < difficulty.minLevel;
	const content = `Required Level: ${difficulty.minLevel}`;

	return (
		<Tooltip content={content} enabled={locked}>
			<button className={clsx(styles.button, difficultyClass, sizeClass)} disabled={locked} onClick={onSelect}>
				{locked ? (
					<BanIcon width={24} height={24} className={styles.banIcon} />
				) : (
					<ResponsiveText
						className={styles.buttonText}
						width={widthSize}
						height={40}
						maxFontSize={minTextSize}
						minFontSize={minTextSize}>
						{difficulty.name}
					</ResponsiveText>
				)}
				{selected && !locked && <CheckedIcon width={24} height={24} className={iconColor} />}
			</button>
		</Tooltip>
	);
};

export default BossButton;
