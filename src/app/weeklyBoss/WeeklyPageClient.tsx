'use client';

import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState, useCallback, useRef } from 'react';

import WeeklyBossDropdown from '@/components/WeeklyBossDropdown/WeeklyBossDropdown';
import BossIcon from '@assets/svg/boss_slayer.svg';
import ErrorIcon from '@assets/svg/octagon-x.svg';
import Button from '@components/Button/Button';
import ProgressBar from '@components/ProgressBar/ProgressBar';
import ResponsiveText from '@components/ResponsiveText/ResponsiveText';
import ServerDropdown from '@components/ServerDropdown/ServerDropdown';
import { useServerCookie } from '@hooks/useServerCookie';
import { WEEKLY_BOSSES_TOTAL } from '@utils/boss/constants';
import { fetchWithTimeout } from '@utils/fetch/withTimeout';

import styles from './page.module.scss';

import type { BossCharacter, BossServer } from '@/models/bossList';
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

interface WeeklyPageClientProps {
	searchParams?: Record<string, string | undefined>;
	username: string;
}

const WeeklyPageClient = ({ username }: WeeklyPageClientProps): JSX.Element => {
	const pathname = usePathname();
	const router = useRouter();
	const { server: serverCookie, setServerCookie } = useServerCookie();

	const [serverData, setServerData] = useState<BossServer | null>(null);
	const [loading, setLoading] = useState<boolean>(true);

	const [weeklyBosses, setWeeklyBosses] = useState<number>(0);
	const [totalGains, setTotalGains] = useState<number>(0);
	const [characters, setCharacters] = useState<BossCharacter[]>([]);

	const abortController = useRef<AbortController | null>(null);

	const BOSS_ICON_SIZE = 96;

	const loadBossList = useCallback(async (): Promise<void> => {
		if (!serverCookie || !username) return;

		// Cancel any previous request
		if (abortController.current) abortController.current.abort();
		const controller = new AbortController();
		abortController.current = controller;

		setLoading(true);
		try {
			const response = await fetchBossList({ userOrigin: username, server: serverCookie }, controller.signal);
			if (!controller.signal.aborted && response.success && response.data) {
				setServerData(response.data);
			} else {
				setServerData(null);
			}
		} catch (error) {
			if (!(error instanceof DOMException && error.name === 'AbortError')) {
				console.error(error);
			}
		} finally {
			if (!controller.signal.aborted) setLoading(false);
		}
	}, [serverCookie, username]);

	// Fetch on mount and when server changes
	useEffect((): (() => void) => {
		void loadBossList();
		return (): void => {
			if (abortController.current) abortController.current.abort();
		};
	}, [loadBossList]);

	const formattedTotalGains = (serverData?.totalGains ?? 0).toLocaleString('en-US');

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
						<p className={styles.weekTitle}>Week Progress</p>
						<p className={styles.weekProgressNumber}>
							{serverData?.weeklyBosses ?? 0}/{WEEKLY_BOSSES_TOTAL}
						</p>
						<ProgressBar
							height={16}
							width={240}
							value={serverData?.weeklyBosses ?? 0}
							maxValue={WEEKLY_BOSSES_TOTAL}
							jobType={'default'}
						/>
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
						<p className={styles.totalGainTitle}>Total Gain</p>
						<ResponsiveText className={styles.totalGainValue} width={272} height={38} maxFontSize={32} minFontSize={12}>
							{formattedTotalGains}
						</ResponsiveText>
					</div>
				</div>
				<div className={styles.serverDropdown}>
					<ServerDropdown serverCookie={serverCookie} setServerCookie={setServerCookie} />
				</div>

				<Button className={styles.editCharacterButton} onClick={(): void => router.push(`${pathname}/edit`)}>
					Edit Bosses
				</Button>
			</div>
			<div className={styles.contentWrapper}>
				{!loading && serverData ? (
					<pre className={styles.bossListPreview}>{JSON.stringify(serverData, null, 2)}</pre>
				) : (
					<div className={styles.notFoundList}>
						<ErrorIcon width={BOSS_ICON_SIZE} height={BOSS_ICON_SIZE} className={styles.errorIcon} />
						<p className={styles.title}>No character found!</p>
						<p className={styles.text}>You haven&apos;t marked any characters as Boss Slayer yet.</p>
						<p className={styles.text}>Go to your desired character and set it as a Boss Slayer to see them here.</p>
					</div>
				)}
			</div>
			<div>
				<WeeklyBossDropdown serverCookie={serverCookie} setServerCookie={setServerCookie} />
			</div>
		</section>
	);
};

export default WeeklyPageClient;
