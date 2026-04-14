'use client';

import * as Popover from '@radix-ui/react-popover';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useRef, useState, useTransition } from 'react';

import SearchIcon from '@assets/svg/search.svg';
import Loader from '@components/Loader/loader';
import { generateClassCode } from '@data/classes/classes';
import { getServerImageByName } from '@data/servers/servers';
import { characterApi } from '@features/character/characterApi';

import { useDebouncedValue } from './hooks/useDebouncedValue';
import styles from './searchBar.module.scss';

import type { searchCharacterResponseBody } from '@features/character/schemas/character.response.schema';
import type { JSX } from 'react';

const MIN_QUERY_LENGTH = 3;
const DEBOUNCE_MS = 300;

const SearchBar = (): JSX.Element => {
	const [open, setOpen] = useState<boolean>(false);
	const [query, setQuery] = useState<string>('');
	const [options, setOptions] = useState<searchCharacterResponseBody['characters']>([]);
	const [isPending, startTransition] = useTransition();

	const inputRef = useRef<HTMLInputElement | null>(null);
	const requestIdRef = useRef<number>(0);

	const debouncedQuery = useDebouncedValue<string>(query, DEBOUNCE_MS);

	useEffect((): void => {
		if (debouncedQuery.length < MIN_QUERY_LENGTH) {
			setOptions([]);
			return;
		}

		const currentRequestId = ++requestIdRef.current;

		startTransition((): void => {
			void (async (): Promise<void> => {
				try {
					const response = await characterApi.searchCharacter({ parameters: debouncedQuery });

					if (requestIdRef.current !== currentRequestId) {
						return;
					}

					if (response.success) {
						setOptions(response.data?.characters ?? []);
					} else {
						setOptions([]);
					}
				} catch {
					if (requestIdRef.current === currentRequestId) {
						setOptions([]);
					}
				}
			})();
		});
	}, [debouncedQuery]);

	const isLoading = isPending;

	return (
		<Popover.Root open={open} onOpenChange={setOpen}>
			<Popover.Anchor asChild>
				<div className={styles.searchBar}>
					<div className={styles.searchDiv}>
						<SearchIcon width={32} height={32} className={styles.icon} />
						<input
							ref={inputRef}
							className={styles.search}
							value={query}
							onFocus={(): void => setOpen(true)}
							onChange={(event): void => setQuery(event.target.value)}
							placeholder="Search by character name or class"
							role="combobox"
							aria-expanded={open}
							aria-controls="async-select-list"
						/>
					</div>
				</div>
			</Popover.Anchor>

			<Popover.Content
				sideOffset={4}
				onOpenAutoFocus={(event): void => event.preventDefault()}
				onCloseAutoFocus={(event): void => event.preventDefault()}>
				<div id="async-select-list" role="listbox">
					{isLoading && (
						<div className={styles.searching}>
							<Loader width={24} height={24} color={'#121212'} borderWidth={3} />
						</div>
					)}

					{!isLoading && debouncedQuery.length >= MIN_QUERY_LENGTH && options.length === 0 && (
						<div className={styles.notFound}>No results</div>
					)}

					{!isLoading && options.length > 0 && (
						<div className={styles.results}>
							{options.map((character): JSX.Element => {
								const imageSrc = getServerImageByName(character.server) ?? '/assets/icons/servers/default.webp';

								return (
									<Link
										key={`${character.server}-${character.name}`}
										href={`/${character.server}/${generateClassCode(character.class)}`}
										prefetch={false}>
										<div
											className={styles.resultItem}
											role="option"
											onMouseDown={(event): void => event.preventDefault()}>
											<Image src={imageSrc} width={48} height={48} alt={`${character.server} Icon`} />
											<span>
												{character.server}: {character.name} - {character.class}
											</span>
										</div>
									</Link>
								);
							})}
						</div>
					)}
				</div>
			</Popover.Content>
		</Popover.Root>
	);
};

export default SearchBar;
