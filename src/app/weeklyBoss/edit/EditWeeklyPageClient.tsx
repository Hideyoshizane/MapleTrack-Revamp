'use client';

import NumberFlow from '@number-flow/react';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState, useCallback, useRef } from 'react';

import FullPageLoader from '@/components/FullPageLoader/FullPageLoader';
import WeeklyBossDropdown from '@/components/WeeklyBossDropdown/WeeklyBossDropdown';
import { useBossListStore } from '@/store/bossListStore';
import BossIcon from '@assets/svg/boss_slayer.svg';
import Button from '@components/Button/Button';
import {
	WEEKLY_BOSSES_TOTAL,
	WEEKLY_BOSSES_PER_CHARACTER,
	MONTHLY_BOSSES_PER_CHARACTER,
} from '@constants/bossConstants';
import { useServerCookie } from '@hooks/useServerCookie';
import { fetchWithTimeout } from '@utils/withTimeout';

import BossGrid from './components/BossGrid/BossGrid';
import styles from './page.module.scss';

import type { BossServer, BossCharacter } from '@features/Boss/bossListModel';
import type { GetBossListRequestBody, GetBossListApiResponse } from '@sharedTypes/bossList';
import type { JSX } from 'react';

const fetchBossList = async (
	payload: GetBossListRequestBody,
	signal?: AbortSignal
): Promise<GetBossListApiResponse> => {
	const res = await fetchWithTimeout('/api/bossList/getBossList', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(payload),
		signal,
	});
	return res.json() as Promise<GetBossListApiResponse>;
};

type EditWeeklyPageClientProps = {
	username: string;
};

const EditWeeklyPageClient = ({ username }: EditWeeklyPageClientProps): JSX.Element => {
	const pathname = usePathname();
	const router = useRouter();
	const { server: serverCookie } = useServerCookie();

	// Zustand selectors
	const hydrate = useBossListStore((s): ((data: BossServer) => void) => s.hydrate);

	const weeklyBosses = useBossListStore((s): number => s.weeklyBosses);

	const characters = useBossListStore((s): BossCharacter[] => s.characters);

	const selectedCharacter = useBossListStore((s): BossCharacter | null => s.selectedCharacter);

	const [loading, setLoading] = useState<boolean>(true);

	const abortController = useRef<AbortController | null>(null);

	const BOSS_ICON_SIZE = 96;

	const loadBossList = useCallback(async (): Promise<void> => {
		if (!serverCookie || !username) {
			return;
		}

		// Cancel any previous request
		if (abortController.current) {
			abortController.current.abort();
		}
		const controller = new AbortController();
		abortController.current = controller;

		setLoading(true);
		try {
			const response = await fetchBossList({ userOrigin: username, server: serverCookie }, controller.signal);

			if (!controller.signal.aborted && response.success && response.data) {
				// Hydrate Zustand store
				hydrate(response.data);
			}
		} catch (error) {
			if (!(error instanceof DOMException && error.name === 'AbortError')) {
				console.error(error);
			}
		} finally {
			if (!controller.signal.aborted) setLoading(false);
		}
	}, [hydrate, serverCookie, username]);

	// Fetch on mount and when bossList changes
	useEffect((): (() => void) => {
		void loadBossList();
		return (): void => {
			if (abortController.current) {
				abortController.current.abort();
			}
		};
	}, [loadBossList]);

	if (loading) {
		return <FullPageLoader />;
	}

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
						setSelectedCharacter={useBossListStore.getState().setSelectedCharacter}
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
			<BossGrid serverCookie={serverCookie} selectedCharacterLevel={selectedCharacter!.level} />
		</section>
	);
};

export default EditWeeklyPageClient;
