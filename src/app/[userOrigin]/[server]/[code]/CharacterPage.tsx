'use client';

import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect } from 'react';
import { toast } from 'react-hot-toast';

import FullPageLoader from '@components/FullPageLoader/FullPageLoader';
import { useCharacterData } from '@hooks/useCharacterData';
import { useExtraCharacterData } from '@hooks/useExtraCharacterData';
import { getJob } from '@utils/jobs/getJob';

import CharacterHeader from './components/CharacterHeader/CharacterHeader';
import CharacterStats from './components/CharacterStats/CharacterStats';
import SymbolsSection from './components/SymbolsSection/SymbolsSection';
import styles from './page.module.scss';

import type { JobType } from '@components/ProgressBar/ProgressBar';
import type { JSX } from 'react';

interface CharacterPageProps {
	userOrigin: string;
	server: string;
	code: string;
}

const CharacterPage = ({ userOrigin, server, code }: CharacterPageProps): JSX.Element => {
	const router = useRouter();
	const searchParams = useSearchParams();
	const success = searchParams.get('success');

	useEffect((): void => {
		if (success === '1') {
			toast.success('Character updated successfully!');
			const basePath = window.location.pathname;
			router.replace(basePath, { scroll: false });
		}
	}, [success, router]);

	const { character, loading: characterLoading, error } = useCharacterData({ userOrigin, server, code });
	const { extraData } = useExtraCharacterData({ character, server, characterLoading });

	// Redirect to /error if done loading and no character
	if (!characterLoading && !character) return <FullPageLoader />;
	if (error) throw new Error(error);

	if (!character) {
		return <FullPageLoader />;
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
					<CharacterHeader character={character} extraData={extraData} router={router} />
					<CharacterStats character={character} job={job} jobType={jobType} />
					<SymbolsSection character={character} />
				</div>
			</div>
		</section>
	);
};

export default CharacterPage;
