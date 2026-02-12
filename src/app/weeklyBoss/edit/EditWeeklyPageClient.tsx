'use client';

import NumberFlow from '@number-flow/react';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

import BossIcon from '@assets/svg/boss_slayer.svg';
import Button from '@components/Button/Button';
import FullPageLoader from '@components/FullPageLoader/FullPageLoader';
import WeeklyBossDropdown from '@components/WeeklyBossDropdown/WeeklyBossDropdown';
import {
	WEEKLY_BOSSES_TOTAL,
	WEEKLY_BOSSES_PER_CHARACTER,
	MONTHLY_BOSSES_PER_CHARACTER,
} from '@constants/bossConstants';
import { bossListApi } from '@features/Boss/bossListApi';
import { useServerCookie } from '@hooks/useServerCookie';

import BossGrid from './components/BossGrid/BossGrid';
import styles from './page.module.scss';

import type { ServerName } from '@data/servers/servers';
import type { BossServerDraft as BossServer, BossCharacterDraft as BossCharacter } from '@features/Boss/bossListModel';
import type { JSX } from 'react';

type EditWeeklyPageClientProps = {
	username: string;
	initialServer: ServerName;
};

const EditWeeklyPageClient = ({ username, initialServer }: EditWeeklyPageClientProps): JSX.Element => {
	const pathname = usePathname();
	const router = useRouter();
	const { server } = useServerCookie(initialServer);

	const [loading, setLoading] = useState<boolean>(true);
	const [serverData, setServerData] = useState<BossServer | null>(null);
	const [selectedCharacter, setSelectedCharacter] = useState<BossCharacter | null>(null);

	const BOSS_ICON_SIZE = 96;

	useEffect((): (() => void) | void => {
		if (!server || !username) {
			return;
		}

		const fetchBossList = async (): Promise<void> => {
			setLoading(true);

			try {
				const payload = { userOrigin: username, server };
				const response = await bossListApi.getBossList(payload);

				if (!response.success || !response.data) {
					return;
				}

				const data = response.data;

				setServerData(data);

				// Auto-select first character if none selected
				setSelectedCharacter((prev) => prev ?? data.characters[0] ?? null);
			} catch (error) {
				if (!(error instanceof DOMException && error.name === 'AbortError')) {
					console.error(error);
				}
			} finally {
				setLoading(false);
			}
		};

		void fetchBossList();
	}, [server, username]);

	if (loading || !serverData || !selectedCharacter) {
		return <FullPageLoader />;
	}

	const weeklyBosses = serverData.weeklyBosses;
	const characters = serverData.characters;

	return (
		<section className="mainContent">
			<div className={styles.topBar}>
				<div className={styles.bossHunt}>
					<BossIcon width={BOSS_ICON_SIZE} height={BOSS_ICON_SIZE} className={styles.bossIcon} />
					<p className={styles.bossTitle}>Boss Hunting</p>
				</div>
				<div className={styles.weekProgress}>
					<Image
						src="/assets/icons/menu/crystal.webp"
						alt="Boss Crystal Icon"
						width={64}
						height={72}
						quality={100}
						priority
						className={styles.icon}
					/>
					<div className={styles.content}>
						<p className={styles.bossOverview}>Boss Overview</p>
						<p className={styles.weekProgressNumber}>
							{weeklyBosses}/{WEEKLY_BOSSES_TOTAL}
						</p>
					</div>
				</div>
				<div className={styles.totalGain}>
					<Image
						src="/assets/icons/menu/stash.webp"
						alt="Gold Stash Icon"
						width={80}
						height={80}
						quality={100}
						priority
						className={styles.icon}
					/>
					<div className={styles.content}>
						<p className={styles.charactersIncome}>Total Earnings Overview</p>
						<NumberFlow className={styles.totalIncome} value={46945733125} format={{ maximumFractionDigits: 0 }} />
					</div>
				</div>
				<Button
					className={styles.discardChangesButton}
					onClick={(): void => router.push(pathname.replace(/\/edit$/, ''))}>
					Discard Changes
				</Button>
				<Button className={styles.saveChangesButton} onClick={(): void => router.push(`${pathname}/edit`)}>
					Save Changes
				</Button>
			</div>
			<div className={styles.charPart}>
				<div className={styles.serverDropdown}>
					<WeeklyBossDropdown
						selectedCharacter={selectedCharacter}
						characters={characters}
						setSelectedCharacter={setSelectedCharacter}
					/>
				</div>

				<div className={styles.characterInfo}>
					<Image
						src="/assets/icons/menu/gold.webp"
						alt="Gold coin Icon"
						width={66}
						height={64}
						quality={100}
						priority
						className={styles.icon}
					/>
					<div className={styles.content}>
						<p className={styles.goldTitle}>Character Income</p>
						<NumberFlow className={styles.goldTotal} value={46945733125} format={{ maximumFractionDigits: 0 }} />
					</div>
				</div>

				<div className={styles.characterInfo}>
					<Image
						src="/assets/icons/menu/weekly.webp"
						alt="Weekly Crystal Icon"
						width={64}
						height={72}
						quality={100}
						priority
						className={styles.icon}
					/>
					<div className={styles.content}>
						<p className={styles.weeklyBoss}>Weekly Boss Count</p>
						<p className={styles.weeklyNumber}>
							{WEEKLY_BOSSES_PER_CHARACTER}/{WEEKLY_BOSSES_PER_CHARACTER}
						</p>
					</div>
				</div>
				<div className={styles.characterInfo}>
					<Image
						src="/assets/icons/menu/monthly.webp"
						alt="Monthly Crystal Icon"
						width={64}
						height={72}
						quality={100}
						priority
						className={styles.icon}
					/>
					<div className={styles.content}>
						<p className={styles.monthlyBoss}>Monthly Boss Count</p>
						<p className={styles.monthlyNumber}>
							{MONTHLY_BOSSES_PER_CHARACTER}/{MONTHLY_BOSSES_PER_CHARACTER}
						</p>
					</div>
				</div>
			</div>
			<BossGrid serverCookie={server} selectedCharacter={selectedCharacter} />
		</section>
	);
};

export default EditWeeklyPageClient;
