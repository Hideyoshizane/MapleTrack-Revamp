'use client';
import { useEffect, useState } from 'react';

import { JobClasses } from '@data/classes/classes';
import { generateCharacterObject } from '@service/characterService';
import { fetchWithTimeout } from '@utils/fetch/withTimeout';

import { SkeletonWrapper } from '../SkeletonWrapper/SkeletonWrapper';

import ClassCard from './ClassCard';
import styles from './ClassGrid.module.css';

import type { ClassFilterOption } from '@/utils/cookies/classFilterCookie';
import type { CharacterDocument } from '@models/character';
import type { GetAllCharactersApiResponse, GetAllCharactersRequestBody } from '@sharedTypes/character';

interface ClassGridProps {
	username: string;
	serverCookie: string | undefined;
	selectedClasses: ClassFilterOption[];
}

async function fetchCharactersApi(payload: GetAllCharactersRequestBody): Promise<GetAllCharactersApiResponse> {
	const res = await fetchWithTimeout('/api/characters/getAllCharacters', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(payload),
	});

	return (await res.json()) as GetAllCharactersApiResponse;
}

const CLASS_ORDER = ['mage', 'warrior', 'thief', 'bowman', 'pirate'];

export default function ClassGrid({ username, serverCookie, selectedClasses }: ClassGridProps) {
	const [jobResults, setJobResults] = useState<CharacterDocument[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		if (!username || !serverCookie) return;

		const fetchCharacters = async () => {
			try {
				setLoading(true);
				setError(null);

				const data = await fetchCharactersApi({ username, server: serverCookie });

				if (!data.success) throw new Error(data.error ?? 'Failed to fetch characters');

				const fetchedCharacters: CharacterDocument[] = Array.isArray(data.data) ? data.data : [];

				// Build all characters
				const results = JobClasses.map((job) => {
					const match = fetchedCharacters.find((char) => char.class === job.className);

					return (
						match ??
						generateCharacterObject({
							jobClassName: job.className,
							jobType: job.jobType,
							legion: job.legionType,
							code: job.code,
							linkSkill: job.linkSkill,
							server: serverCookie,
							userOrigin: username,
						})
					);
				});

				// Filter results with special rules
				const filteredResults = results.filter((char) => {
					if (selectedClasses.length === 0) return true; // no filter → show all
					if (char.bossing && selectedClasses.includes('bossing')) return true; // bossing rule
					if (char.jobType === 'xenon' && (selectedClasses.includes('pirate') || selectedClasses.includes('thief')))
						return true; // xenon rule
					return selectedClasses.includes(char.jobType as ClassFilterOption); // regular rule
				});

				// Sort the filtered results
				const sortedResults = [...filteredResults].sort((a, b) => {
					// Treat Xenon as Thief for ordering
					const aType = a.jobType ? (a.jobType === 'xenon' ? 'thief' : a.jobType) : 'zzz';
					const bType = b.jobType ? (b.jobType === 'xenon' ? 'thief' : b.jobType) : 'zzz';

					const aIndex = CLASS_ORDER.indexOf(aType);
					const bIndex = CLASS_ORDER.indexOf(bType);

					// Compare by CLASS_ORDER first
					if (aIndex !== bIndex) return aIndex - bIndex;

					// If same jobType, sort alphabetically by class name
					return (a.class ?? '').localeCompare(b.class ?? '');
				});

				setJobResults(sortedResults);
			} catch (err: unknown) {
				console.error('Error fetching characters:', err);
				setError(err instanceof Error ? err.message : String(err));
			} finally {
				setLoading(false);
			}
		};
		void fetchCharacters();
	}, [username, serverCookie, selectedClasses]);

	if (error) return <p className={styles.error}>Error: {error}</p>;

	return (
		<div className={styles.classGrid}>
			{loading
				? JobClasses.map((job) => (
						<div key={job.className} className={styles.skeletonWrapper}>
							<SkeletonWrapper width={502} height={368} color="light" variant="rectangular" />
						</div>
				  ))
				: jobResults.map((character) => <ClassCard key={character.class} character={character} />)}
		</div>
	);
}
