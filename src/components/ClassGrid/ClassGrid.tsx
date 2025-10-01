'use client';
import { redirect } from 'next/navigation';
import { useEffect, useState, useCallback, useMemo } from 'react';

import { SkeletonWrapper } from '@components/SkeletonWrapper/SkeletonWrapper';
import { JobClasses } from '@data/classes/classes';
import { generateCharacterObject } from '@service/characterService';
import { fetchWithTimeout } from '@utils/fetch/withTimeout';

import ClassCard from './ClassCard/ClassCard';
import styles from './ClassGrid.module.scss';

import type { CharacterDocument } from '@models/character';
import type { GetAllCharactersApiResponse, GetAllCharactersRequestBody } from '@sharedTypes/character';
import type { ClassFilterOption } from '@utils/cookies/classFilterCookie';
import type { JSX } from 'react';

const CLASS_ORDER = ['mage', 'warrior', 'thief', 'bowman', 'pirate'];

interface ClassGridProps {
	username: string;
	serverCookie: string | undefined;
	selectedClasses: ClassFilterOption[];
}

const fetchCharactersApi = async (payload: GetAllCharactersRequestBody): Promise<GetAllCharactersApiResponse> => {
	const res: Response = await fetchWithTimeout('/api/characters/getAllCharacters', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(payload),
	});

	return (await res.json()) as GetAllCharactersApiResponse;
};

const filterCharacters = (results: CharacterDocument[], selectedClasses: ClassFilterOption[]): CharacterDocument[] => {
	return results.filter((char): boolean => {
		if (selectedClasses.length === 0) return true;
		if (char.bossing && selectedClasses.includes('bossing')) return true;
		if (char.jobType === 'xenon' && (selectedClasses.includes('pirate') || selectedClasses.includes('thief'))) {
			return true;
		}
		return selectedClasses.includes(char.jobType as ClassFilterOption);
	});
};

const sortCharacters = (characters: CharacterDocument[]): CharacterDocument[] => {
	return [...characters].sort((a, b): number => {
		const aType: string = a.jobType ? (a.jobType === 'xenon' ? 'thief' : a.jobType) : 'zzz';
		const bType: string = b.jobType ? (b.jobType === 'xenon' ? 'thief' : b.jobType) : 'zzz';

		const aIndex: number = CLASS_ORDER.indexOf(aType);
		const bIndex: number = CLASS_ORDER.indexOf(bType);

		if (aIndex !== bIndex) return aIndex - bIndex;
		return (a.class ?? '').localeCompare(b.class ?? '');
	});
};

const ClassGrid: React.FC<ClassGridProps> = ({
	username,
	serverCookie,
	selectedClasses,
}: ClassGridProps): JSX.Element => {
	const [jobResults, setJobResults] = useState<CharacterDocument[]>([]);
	const [loading, setLoading] = useState<boolean>(true);
	const [error, setError] = useState<string | null>(null);

	// Pre-build skeletons only once
	const skeletons = useMemo<JSX.Element[]>(
		(): JSX.Element[] =>
			JobClasses.map(
				(job): JSX.Element => (
					<div key={job.className} className={styles.skeletonWrapper}>
						<SkeletonWrapper width={502} height={368} color="light" variant="rectangular" />
					</div>
				)
			),
		[]
	);

	// Main fetch logic wrapped in useCallback to avoid re-creation
	const fetchCharacters = useCallback(async (): Promise<void> => {
		try {
			setLoading(true);
			setError(null);

			if (!serverCookie) {
				// Redirect to error page
				redirect('/error');
			}

			const data: GetAllCharactersApiResponse = await fetchCharactersApi({
				username,
				server: serverCookie,
			});

			if (!data.success) throw new Error(data.error ?? 'Failed to fetch characters');

			const fetchedCharacters: CharacterDocument[] = Array.isArray(data.data) ? data.data : [];

			// Build all characters
			const results: CharacterDocument[] = JobClasses.map((job): CharacterDocument => {
				const match = fetchedCharacters.find((char): boolean => char.class === job.className);
				return (match ??
					generateCharacterObject({
						jobClassName: job.className,
						jobType: job.jobType,
						legion: job.legionType,
						code: job.code,
						linkSkill: job.linkSkill,
						server: serverCookie,
						userOrigin: username,
					})) as CharacterDocument;
			});

			// Apply filters + sorting
			const filteredResults = filterCharacters(results, selectedClasses);
			const sortedResults = sortCharacters(filteredResults);

			setJobResults(sortedResults);
		} catch (err: unknown) {
			console.error('Error fetching characters:', err);
			setError(err instanceof Error ? err.message : String(err));
		} finally {
			setLoading(false);
		}
	}, [username, serverCookie, selectedClasses]);

	// Trigger fetch on dependency changes
	useEffect((): void => {
		if (!username || !serverCookie) return;
		void fetchCharacters();
	}, [fetchCharacters, username, serverCookie]);

	// Render error state
	if (error) {
		return (
			<div className={styles.error}>
				<p>Error: {error}</p>
				<button onClick={(): undefined => void fetchCharacters()}>Retry</button>
			</div>
		);
	}

	// Render content
	return (
		<div className={styles.classGrid}>
			{loading
				? skeletons
				: jobResults.map((character): JSX.Element => <ClassCard key={character.class} character={character} />)}
		</div>
	);
};

export default ClassGrid;
