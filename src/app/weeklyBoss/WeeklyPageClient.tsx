'use client';

import NumberFlow from '@number-flow/react';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';

import BossIcon from '@assets/svg/boss_slayer.svg';
import ErrorIcon from '@assets/svg/octagon-x.svg';
import Button from '@components/Button/Button';
import FullPageLoader from '@components/FullPageLoader/FullPageLoader';
import ProgressBar from '@components/ProgressBar/ProgressBar';
import ServerDropdown from '@components/ServerDropdown/ServerDropdown';
import { WEEKLY_BOSSES_TOTAL } from '@constants/bossConstants';
import { useServerCookie } from '@hooks/useServerCookie';

import CharactersBossGrid from './components/CharactersBossGrid/CharactersBossGrid';
import { useWeeklyBossList } from './hooks/useWeeklyBossList';
import styles from './Page.module.scss';

import type { ServerName } from '@data/servers/servers';
import type { JSX } from 'react';

type Props = {
	initialServer: ServerName;
};

const BOSS_ICON_SIZE = 96;

const WeeklyPageClient = ({ initialServer }: Props): JSX.Element => {
	const pathname = usePathname();
	const router = useRouter();

	const { server, setServerCookie } = useServerCookie(initialServer);

	const { loading, hasCharacters, weeklyBosses, totalGains, characters, toggleBoss } = useWeeklyBossList(server);

	if (loading) {
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
						<p className={styles.weekTitle}>Week Progress</p>

						<p className={styles.weekProgressNumber}>
							{weeklyBosses}/{WEEKLY_BOSSES_TOTAL}
						</p>

						<ProgressBar
							height={16}
							jobType={'default'}
							maxValue={WEEKLY_BOSSES_TOTAL}
							value={weeklyBosses}
							width={240}
						/>
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
						<p className={styles.totalGainTitle}>Total Gain</p>
						<NumberFlow className={styles.totalGainValue} value={totalGains} />
					</div>
				</div>

				<div className={styles.serverDropdown}>
					<ServerDropdown server={server} setServerCookie={setServerCookie} />
				</div>

				<Button
					className={styles.editCharacterButton}
					disabled={!hasCharacters}
					onClick={(): void => router.push(`${pathname}/edit`)}
				>
					Edit Bosses
				</Button>
			</div>

			{hasCharacters ? (
				<div className={styles.contentWrapper}>
					<CharactersBossGrid
						characterList={characters}
						handleBossToggle={(bossMonsterId: string): void => {
							void toggleBoss(bossMonsterId);
						}}
						server={server}
					/>
				</div>
			) : (
				<div className={styles.wrapper}>
					<div className={styles.notFoundList}>
						<ErrorIcon className={styles.errorIcon} height={BOSS_ICON_SIZE} width={BOSS_ICON_SIZE} />

						<p className={styles.title}>No character found!</p>

						<p className={styles.text}>You haven&apos;t marked any characters as Boss Slayer yet.</p>

						<p className={styles.text}>
							Go to your desired character and set it as a Boss Slayer to see them here.
						</p>
					</div>
				</div>
			)}
		</section>
	);
};

export default WeeklyPageClient;
