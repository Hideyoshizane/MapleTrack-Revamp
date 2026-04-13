'use client';

import NumberFlow from '@number-flow/react';
import { produce } from 'immer';
import Image from 'next/image';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';

import BossIcon from '@assets/svg/boss_slayer.svg';
import ErrorIcon from '@assets/svg/octagon-x.svg';
import Button from '@components/Button/button';
import FullPageLoader from '@components/FullPageLoader/fullPageLoader';
import ProgressBar from '@components/ProgressBar/progressBar';
import ServerDropdown from '@components/ServerDropdown/serverDropdown';
import { WEEKLY_BOSSES_TOTAL } from '@constants/bossConstants';
import { bossListApi } from '@features/Boss/bossListApi';
import { useServerCookie } from '@hooks/useServerCookie';

import CharactersBossGrid from './components/CharactersBossGrid/charactersBossGrid';
import styles from './page.module.scss';

import type { ServerName } from '@data/servers/servers';
import type { getBossListResponseBody } from '@features/Boss/schemas/bossList.response.schema';
import type { JSX } from 'react';

type WeeklyPageClientProps = {
	initialServer: ServerName;
};

const WeeklyPageClient = ({ initialServer }: WeeklyPageClientProps): JSX.Element => {
	const pathname = usePathname();
	const router = useRouter();
	const searchParams = useSearchParams();
	const success = searchParams.get('success');

	const { server, setServerCookie } = useServerCookie(initialServer);

	const [bossList, setbossList] = useState<getBossListResponseBody | null>(null);
	const [loading, setLoading] = useState<boolean>(true);

	const weeklyBosses = bossList?.weeklyBosses ?? 0;
	const totalGains = bossList?.totalGains ?? 0;
	const characters = bossList?.characters ?? [];

	useEffect((): void => {
		if (success === '1') {
			toast.success('Boss List updated successfully!');
			const basePath = window.location.pathname;
			router.replace(basePath, { scroll: false });
		}
	}, [success, router]);

	const BOSS_ICON_SIZE = 96;

	const loadBossList = async (): Promise<void> => {
		setLoading(true);
		try {
			const payload = { server };
			const response = await bossListApi.getBossList(payload);

			if (!response.success || !response.data) {
				setbossList(null);
				return;
			}

			const nextServerData = produce(response.data, (draft) => {
				draft.weeklyBosses ??= 0;
				draft.totalGains ??= 0;
				draft.characters ??= [];
			});

			setbossList(nextServerData);
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
	}, [server]);

	const handleBossToggle = async (bossMonsterId: string): Promise<void> => {
		try {
			const bossListId = bossList?.id;
			if (!bossListId) {
				return;
			}
			const payload = { bossListId: bossListId, bossMonsterId: bossMonsterId };
			const response = await bossListApi.toggleBoss(payload);
			if (!response.success || !response.data) {
				toast.error('Failed to update boss');
				return;
			}

			const { weeklyBossesUpdate, totalGainUpdate } = response.data;

			setbossList(
				produce((draft) => {
					if (!draft) {
						return;
					}

					draft.weeklyBosses += weeklyBossesUpdate;
					draft.totalGains += totalGainUpdate;

					for (const character of draft.characters) {
						const boss = character.bosses.find((boss) => boss.id === bossMonsterId);

						if (boss) {
							boss.cleared = !boss.cleared;
							break;
						}
					}
				}),
			);
		} catch (error) {
			console.error(error);
			toast.error('Unexpected error');
		}
	};

	if (loading) {
		return <FullPageLoader />;
	}

	const hasCharacters: boolean = characters.length > 0;

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

				<Button
					className={styles.editCharacterButton}
					disabled={!hasCharacters}
					onClick={(): void => router.push(`${pathname}/edit`)}>
					Edit Bosses
				</Button>
			</div>
			{hasCharacters ? (
				<div className={styles.contentWrapper}>
					<CharactersBossGrid
						characterList={characters}
						server={server}
						handleBossToggle={(bossMonsterId: string): void => {
							void handleBossToggle(bossMonsterId);
						}}
					/>
				</div>
			) : (
				<div className={styles.wrapper}>
					<div className={styles.notFoundList}>
						<ErrorIcon width={BOSS_ICON_SIZE} height={BOSS_ICON_SIZE} className={styles.errorIcon} />
						<p className={styles.title}>No character found!</p>
						<p className={styles.text}>You haven&apos;t marked any characters as Boss Slayer yet.</p>
						<p className={styles.text}>Go to your desired character and set it as a Boss Slayer to see them here.</p>
					</div>
				</div>
			)}
		</section>
	);
};

export default WeeklyPageClient;
