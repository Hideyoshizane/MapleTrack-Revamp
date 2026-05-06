'use client';

import * as Popover from '@radix-ui/react-popover';
import Image from 'next/image';
import Link from 'next/link';
import { useRef, useState } from 'react';

import SearchIcon from '@assets/svg/search.svg';
import Loader from '@components/Loader/Loader';
import { generateClassCode } from '@data/classes/classes';
import { getServerImageByName } from '@data/servers/servers';

import { useCharacterSearch } from './hooks/useCharacterSearch';
import styles from './SearchBar.module.scss';

import type { JSX } from 'react';

const SearchBar = (): JSX.Element => {
	const [open, setOpen] = useState<boolean>(false);
	const inputRef = useRef<HTMLInputElement | null>(null);

	const { query, setQuery, results, isLoading, hasSearched } = useCharacterSearch();

	return (
		<Popover.Root onOpenChange={setOpen} open={open}>
			<Popover.Anchor asChild>
				<div className={styles.searchBar}>
					<div className={styles.searchDiv}>
						<SearchIcon className={styles.icon} height={32} width={32} />

						<input
							className={styles.search}
							aria-controls="async-select-list"
							aria-expanded={open}
							onChange={(event): void => setQuery(event.target.value)}
							onFocus={(): void => setOpen(true)}
							placeholder="Search by character name or class"
							ref={inputRef}
							role="combobox"
							value={query}
						/>
					</div>
				</div>
			</Popover.Anchor>

			<Popover.Content
				onCloseAutoFocus={(event): void => event.preventDefault()}
				onOpenAutoFocus={(event): void => event.preventDefault()}
				sideOffset={4}>
				<div id="async-select-list" role="listbox">
					{isLoading && (
						<div className={styles.searching}>
							<Loader borderWidth={3} color={'#121212'} height={24} width={24} />
						</div>
					)}

					{!isLoading && hasSearched && results.length === 0 && <div className={styles.notFound}>No results</div>}

					{!isLoading && results.length > 0 && (
						<div className={styles.results}>
							{results.map((character): JSX.Element => {
								const imageSrc = getServerImageByName(character.server) ?? '/assets/icons/servers/default.webp';

								return (
									<Link
										href={`/${character.server}/${generateClassCode(character.class)}`}
										key={`${character.server}-${character.name}`}
										prefetch={false}>
										<div
											className={styles.resultItem}
											onMouseDown={(event): void => event.preventDefault()}
											role="option">
											<Image alt={`${character.server} Icon`} height={48} src={imageSrc} width={48} />

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
