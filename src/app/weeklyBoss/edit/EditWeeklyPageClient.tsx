'use client';

import NumberFlow from '@number-flow/react';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';

import BossIcon from '@assets/svg/boss_slayer.svg';
import Button from '@components/Button/Button';
import FullPageLoader from '@components/FullPageLoader/FullPageLoader';
import {
	WEEKLY_BOSSES_TOTAL,
	WEEKLY_BOSSES_PER_CHARACTER,
	MONTHLY_BOSSES_PER_CHARACTER,
} from '@constants/bossConstants';
import { useServerCookie } from '@hooks/useServerCookie';

import BossGrid from './components/BossGrid/BossGrid';
import WeeklyBossDropdown from './components/CharacterSelectBossDropdown/CharacterSelectBossDropdown';
import { useEditWeeklyBossList } from './hooks/useEditWeeklyBossList';
import styles from './Page.module.scss';

import type { ServerName } from '@data/servers/servers';
import type { JSX } from 'react';

type Props = {
	initialServer: ServerName;
};

const EditWeeklyPageClient = ({ initialServer }: Props): JSX.Element => {
	const pathname = usePathname();
	const router = useRouter();

	const { server } = useServerCookie(initialServer);

	const {
		loading,
		serverData,
		selectedCharacter,
		totalBosses,
		totalGains,
		characterWeeklyIncome,
		characterWeeklyBossAmount,
		characterMonthlyBossAmount,
		setSelectedCharacter,
		handleBossUpdate,
		handleSaveChanges,
	} = useEditWeeklyBossList(server);

	const BOSS_ICON_SIZE = 96;

	if (loading || !serverData || !selectedCharacter) {
		return (
			<section className="mainContent">
				<FullPageLoader />
			</section>
		);
	}

	return (
		<section className="mainContent">
			<div className={styles.topBar}>
				<div className={styles.bossHunt}>
					<BossIcon className={styles.bossIcon} height={BOSS_ICON_SIZE} width={BOSS_ICON_SIZE} />
					<p className={styles.bossTitle}>Boss Hunting</p>
				</div>
				<div className={styles.weekProgress}>
					<Image
						className={styles.icon}
						alt="Boss Crystal Icon"
						height={72}
						priority
						quality={100}
						src="/assets/icons/menu/crystal.webp"
						width={64}
					/>
					<div className={styles.content}>
						<p className={styles.bossOverview}>Boss Overview</p>
						<p className={styles.weekProgressNumber}>
							<NumberFlow value={totalBosses} />
							{`/${WEEKLY_BOSSES_TOTAL}`}
						</p>
					</div>
				</div>
				<div className={styles.totalGain}>
					<Image
						className={styles.icon}
						alt="Gold Stash Icon"
						height={80}
						priority
						quality={100}
						src="/assets/icons/menu/stash.webp"
						width={80}
					/>
					<div className={styles.content}>
						<p className={styles.charactersIncome}>Total Earnings Overview</p>
						<NumberFlow
							className={styles.totalIncome}
							format={{ maximumFractionDigits: 0 }}
							transformTiming={{ duration: 300 }}
							value={totalGains}
						/>
					</div>
				</div>
				<Button
					className={styles.discardChangesButton}
					onClick={(): void => router.push(pathname.replace(/\/edit$/, ''))}>
					Discard Changes
				</Button>
				<Button className={styles.saveChangesButton} onClick={(): void => void handleSaveChanges(pathname)}>
					Save Changes
				</Button>
			</div>
			<div className={styles.charPart}>
				<div className={styles.serverDropdown}>
					<WeeklyBossDropdown
						characters={serverData.characters}
						selectedCharacter={selectedCharacter}
						setSelectedCharacter={setSelectedCharacter}
					/>
				</div>

				<div className={styles.characterInfo}>
					<Image
						className={styles.icon}
						alt="Gold coin Icon"
						height={64}
						priority
						quality={100}
						src="/assets/icons/menu/gold.webp"
						width={66}
					/>
					<div className={styles.content}>
						<p className={styles.goldTitle}>Character Income</p>
						<NumberFlow
							className={styles.goldTotal}
							format={{ maximumFractionDigits: 0 }}
							transformTiming={{ duration: 300 }}
							value={characterWeeklyIncome}
						/>
					</div>
				</div>

				<div className={styles.characterInfo}>
					<Image
						className={styles.icon}
						alt="Weekly Crystal Icon"
						height={72}
						priority
						quality={100}
						src="/assets/icons/menu/weekly.webp"
						width={64}
					/>
					<div className={styles.content}>
						<p className={styles.weeklyBoss}>Weekly Boss Count</p>
						<p className={styles.weeklyNumber}>
							<NumberFlow value={characterWeeklyBossAmount} />
							{`/${WEEKLY_BOSSES_PER_CHARACTER}`}
						</p>
					</div>
				</div>
				<div className={styles.characterInfo}>
					<Image
						className={styles.icon}
						alt="Monthly Crystal Icon"
						height={72}
						priority
						quality={100}
						src="/assets/icons/menu/monthly.webp"
						width={64}
					/>
					<div className={styles.content}>
						<p className={styles.monthlyBoss}>Monthly Boss Count</p>
						<p className={styles.monthlyNumber}>
							<NumberFlow value={characterMonthlyBossAmount} />
							{`/${MONTHLY_BOSSES_PER_CHARACTER}`}
						</p>
					</div>
				</div>
			</div>
			<BossGrid onBossUpdate={handleBossUpdate} selectedCharacter={selectedCharacter} serverCookie={server} />
		</section>
	);
};

export default EditWeeklyPageClient;
