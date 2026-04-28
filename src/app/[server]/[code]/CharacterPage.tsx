'use client';

import { useQueryClient } from '@tanstack/react-query';
import Image from 'next/image';
import { useRouter, useSearchParams, redirect } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';

import ErrorPage from '@components/ErrorPage/errorPage';
import FullPageLoader from '@components/FullPageLoader/fullPageLoader';
import { getClassNameByCode } from '@data/classes/classes';
import { isValidServerName } from '@data/servers/servers';
import { characterQueryKeys } from '@features/character/character.queryKeys';
import { getJob } from '@features/character/characterService';
import { useCharacterExternalQuery } from '@hooks/useCharacterExternalQuery';
import { useCharacterQuery } from '@hooks/useCharacterQuery';

import CharacterHeader from './components/CharacterHeader/characterHeader';
import CharacterStats from './components/CharacterStats/characterStats';
import SymbolsSection from './components/SymbolsSection/symbolsSection';
import { useIncreaseAllSymbols } from './hooks/useIncreaseAllSymbols';
import styles from './page.module.scss';
import { useBonusContext } from './useBonusContext';

import type { JobType } from '@components/ProgressBar/progressBar';
import type { JSX } from 'react';

type CharacterPageProps = {
	server: string;
	code: string;
};

const CharacterPage = ({ server, code }: CharacterPageProps): JSX.Element => {
	const router = useRouter();
	const searchParams = useSearchParams();
	const success = searchParams.get('success');

	const isServerValid = isValidServerName(server);

	const className = getClassNameByCode(code);
	if (!className || !isServerValid) {
		redirect('/error');
	}

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

	const { data: character, isLoading } = useCharacterQuery({ server, className });

	const { data: characterDataApi } = useCharacterExternalQuery({
		name: character?.name,
		server,
		enabled: Boolean(character?.syncing),
	});

	const increaseAllMutation = useIncreaseAllSymbols({
		server: server,
		className: className ?? '',
		id: character?.id ?? '',
		arcaneBonus,
		sacredBonus,
	});

	const handleIncreaseAll = (): void => {
		if (!character?.id) {
			return;
		}
		increaseAllMutation.mutate(undefined, {
			onSuccess: (): void => {
				void queryClient.invalidateQueries({ queryKey: characterQueryKeys.detail(server, className) });
			},
		});
	};

	if (isLoading && !character) {
		return (
			<section className="mainContent">
				<FullPageLoader />
			</section>
		);
	}
	if (!character) {
		return (
			<section className="mainContent">
				<ErrorPage />
			</section>
		);
	}

	const job = getJob(character.level);
	const jobType: JobType = (character.jobType ?? 'default') as JobType;

	return (
		<section className="mainContent">
			<div className={styles.mainDiv}>
				<Image
					alt={`${character.class} class profile Icon`}
					height={827}
					priority
					src={`/assets/profile/${code}.webp`}
					width={650}
				/>
				<div className={styles.characterContent}>
					<CharacterHeader
						character={character}
						extraData={characterDataApi ?? null}
						onIncreaseAll={handleIncreaseAll}
						router={router}
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
