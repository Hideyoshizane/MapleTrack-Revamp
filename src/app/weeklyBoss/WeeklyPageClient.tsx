'use client';

import NumberFlow from '@number-flow/react';
import { produce } from 'immer';
import Image from 'next/image';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';

import BossIcon from '@assets/svg/boss_slayer.svg';
import Button from '@components/Button/Button';
import ProgressBar from '@components/ProgressBar/ProgressBar';
import ServerDropdown from '@components/ServerDropdown/ServerDropdown';
import { WEEKLY_BOSSES_TOTAL } from '@constants/bossConstants';
import { bossListApi } from '@features/Boss/bossListApi';
import { useServerCookie } from '@hooks/useServerCookie';

import CharactersBossGrid from './components/CharactersBossGrid/CharactersBossGrid';
import styles from './page.module.scss';

import type { ServerName } from '@data/servers/servers';
import type { BossServerDraft as BossServer } from '@features/Boss/bossListModel';
import type { JSX } from 'react';

type WeeklyPageClientProps = {
	searchParams?: Record<string, string | undefined>;
	username: string;
	initialServer: ServerName;
};

const WeeklyPageClient = ({ username, initialServer }: WeeklyPageClientProps): JSX.Element => {
	const pathname = usePathname();
	const router = useRouter();
	const searchParams = useSearchParams();
	const success = searchParams.get('success');

	const { server, setServerCookie } = useServerCookie(initialServer);

	const [serverData, setServerData] = useState<BossServer | null>(null);
	const [loading, setLoading] = useState<boolean>(true);

	const weeklyBosses = serverData?.weeklyBosses ?? 0;
	const totalGains = serverData?.totalGains ?? 0;
	const characters = serverData?.characters ?? [];

	useEffect((): void => {
		if (success === '1') {
			toast.success('Boss List updated successfully!');
			const basePath = window.location.pathname;
			router.replace(basePath, { scroll: false });
		}
	}, [success, router]);

	const BOSS_ICON_SIZE = 96;

	const loadBossList = async (): Promise<void> => {
		if (!server || !username) {
			return;
		}

		setLoading(true);
		try {
			const payload = { userOrigin: username, server };
			const response = await bossListApi.getBossList(payload);

			if (!response.success || !response.data) {
				setServerData(null);
				return;
			}

			const nextServerData = produce(response.data, (draft) => {
				draft.weeklyBosses ??= 0;
				draft.totalGains ??= 0;
				draft.characters ??= [];
			});

			setServerData(nextServerData);
		} catch (error) {
			if (!(error instanceof DOMException && error.name === 'AbortError')) {
				console.error(error);
			}
		} finally {
			setLoading(false);
		}
	};

	useEffect((): void => {
		void loadBossList();
		//eslint-disable-next-line
	}, [server, username]);

	const handleBossToggle = async (params: {
		characterCode: string;
		bossName: string;
		difficulty: string;
	}): Promise<void> => {
		if (!server) {
			return;
		}

		try {
			const payload = { server, ...params };
			const response = await bossListApi.toggleBoss(payload);

			if (!response.success || !response.data) {
				toast.error('Failed to update boss');
				return;
			}

			const { weeklyBosses, totalGains, clearedUpdate } = response.data;

			setServerData(
				produce((draft) => {
					if (!draft) {
						return;
					}

					draft.weeklyBosses = weeklyBosses;
					draft.totalGains = totalGains;

					const character = draft.characters.find((character) => character.code === params.characterCode);
					if (character) {
						const boss = character.bosses.find(
							(boss) => boss.name === params.bossName && boss.difficulty === params.difficulty,
						);
						if (boss) {
							boss.cleared = clearedUpdate;
						}
					}
				}),
			);
		} catch (error) {
			console.error(error);
			toast.error('Unexpected error');
		}
	};

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
							{weeklyBosses}/{WEEKLY_BOSSES_TOTAL}
						</p>
						<ProgressBar
							height={16}
							width={240}
							value={weeklyBosses}
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
						<NumberFlow className={styles.totalGainValue} value={totalGains} />
					</div>
				</div>
				<div className={styles.serverDropdown}>
					<ServerDropdown server={server} setServerCookie={setServerCookie} />
				</div>

				<Button className={styles.editCharacterButton} onClick={(): void => router.push(`${pathname}/edit`)}>
					Edit Bosses
				</Button>
			</div>
			<div className={styles.contentWrapper}>
				<CharactersBossGrid
					characterList={characters}
					server={server}
					handleBossToggle={(params): void => {
						void handleBossToggle(params);
					}}
				/>
			</div>
		</section>
	);
};

export default WeeklyPageClient;

// {
// 	!loading && serverData ? (
// 		<pre className={styles.bossListPreview}>{JSON.stringify(serverData, null, 2)}</pre>
// 	) : (
// 		<div className={styles.notFoundList}>
// 			<ErrorIcon width={BOSS_ICON_SIZE} height={BOSS_ICON_SIZE} className={styles.errorIcon} />
// 			<p className={styles.title}>No character found!</p>
// 			<p className={styles.text}>You haven&apos;t marked any characters as Boss Slayer yet.</p>
// 			<p className={styles.text}>Go to your desired character and set it as a Boss Slayer to see them here.</p>
// 		</div>
// 	);
// }
