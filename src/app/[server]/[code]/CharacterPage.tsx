'use client';

import { useQueryClient } from '@tanstack/react-query';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';

import { getJob } from '@/features/character/characterAttributes';
import FullPageLoader from '@components/FullPageLoader/FullPageLoader';
import { characterQueryKeys } from '@features/character/character.queryKeys';
import { useCharacterExternalQuery } from '@hooks/useCharacterExternalQuery';
import { useCharacterQuery } from '@hooks/useCharacterQuery';

import CharacterHeader from './components/CharacterHeader/CharacterHeader';
import CharacterStats from './components/CharacterStats/CharacterStats';
import SymbolsSection from './components/SymbolsSection/SymbolsSection';
import { useIncreaseAllSymbols } from './hooks/useIncreaseAllSymbols';
import styles from './page.module.scss';
import { useBonusContext } from './useBonusContext';

import type { LevelUpResult } from '@/data/symbols/symbolMappings';
import type { JobType } from '@components/ProgressBar/ProgressBar';
import type { JSX } from 'react';

type CharacterPageProps = {
	userOrigin: string;
	server: string;
	code: string;
};

export type UpdateCharacterResponse = {
	success: boolean;
	message: string;
	data: Record<string, LevelUpResult>;
};

const CharacterPage = ({ userOrigin, server, code }: CharacterPageProps): JSX.Element => {
	const router = useRouter();
	const searchParams = useSearchParams();
	const success = searchParams.get('success');

	const queryClient = useQueryClient();

	const [disableAllDaily, setDisableAllDaily] = useState(false);
	const { arcaneBonus, sacredBonus } = useBonusContext();

	useEffect((): void => {
		if (success === '1') {
			toast.success('Character updated successfully!');
			const basePath = window.location.pathname;
			router.replace(basePath, { scroll: false });
		}
	}, [success, router]);

	const { data: character, isLoading, error } = useCharacterQuery({ server, code });

	const { data: characterDataApi } = useCharacterExternalQuery({
		name: character?.name,
		server,
		enabled: Boolean(character?.syncing),
	});

	const increaseAllMutation = useIncreaseAllSymbols({ userOrigin, server, code, arcaneBonus, sacredBonus });

	const handleIncreaseAll = (): void => {
		increaseAllMutation.mutate(undefined, {
			onSuccess: (): void => {
				void queryClient.invalidateQueries({
					queryKey: characterQueryKeys.detail(server, code),
				});
			},
		});
	};

	if (isLoading && !character) {
		return <FullPageLoader />;
	}
	if (!character) {
		throw new Error('Character data missing after load');
	}

	if (error) {
		throw error;
	}

	const job = getJob(character.level);
	const jobType: JobType = (character.jobType ?? 'default') as JobType;

	return (
		<section className="mainContent">
			<div className={styles.mainDiv}>
				<Image
					src={`/assets/profile/${character.code}.webp`}
					width={650}
					height={827}
					priority
					alt={`${character.class} class profile Icon`}
				/>
				<div className={styles.characterContent}>
					<CharacterHeader
						character={character}
						extraData={characterDataApi ?? null}
						router={router}
						onIncreaseAll={handleIncreaseAll}
						setDisableAllDaily={setDisableAllDaily}
					/>

					<CharacterStats character={character} job={job} jobType={jobType} />
					<SymbolsSection character={character} disableAllDaily={disableAllDaily} />
				</div>
			</div>
		</section>
	);
};

export default CharacterPage;
