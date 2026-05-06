'use client';

import * as ScrollArea from '@radix-ui/react-scroll-area';
import * as Select from '@radix-ui/react-select';
import Image from 'next/image';

import MenuIcon from '@assets/svg/menu.svg';
import { generateClassCode } from '@data/classes/classes';

import CharacterLiberationItem from './CharacterLiberationItem/CharacterLiberationItem';
import styles from './CharacterSelectBossDropdown.module.scss';

import type { GetLiberationListCharacterResponseBody } from '@features/liberation/schemas/liberation.response.schema';
import type { JSX } from 'react';

type Props = {
	setSelectedCharacter: (value: GetLiberationListCharacterResponseBody) => void;
	selectedCharacter: GetLiberationListCharacterResponseBody | null;
	characters: GetLiberationListCharacterResponseBody[];
};

const CharacterSelectLiberationDropdown = ({
	setSelectedCharacter,
	selectedCharacter,
	characters,
}: Props): JSX.Element => {
	if (!selectedCharacter) {
		return <div />;
	}

	const code = generateClassCode(selectedCharacter.class);

	return (
		<Select.Root
			onValueChange={(value): void => {
				const found = characters.find((c) => c.class === value);
				if (found) {
					setSelectedCharacter(found);
				}
			}}
			value={selectedCharacter.class}>
			<Select.Trigger className={styles.selectedCharacterWrapper}>
				<div className={styles.nameDiv}>
					<p className={styles.characterName}>{selectedCharacter.name}</p>
					<p className={styles.characterClass}>{selectedCharacter.class}</p>
				</div>
				<div className={styles.iconsDiv}>
					<MenuIcon className={styles.chevronIcon} />
				</div>

				<Image
					className={styles.classIcon}
					alt={selectedCharacter.name}
					height={80}
					priority
					src={`/assets/buttom_profile/${code}.webp`}
					width={480}
				/>
			</Select.Trigger>

			<Select.Portal>
				<Select.Content className={styles.characterList} position="popper">
					<ScrollArea.Root className={styles.scrollAreaRoot} type="auto">
						<ScrollArea.Viewport className={styles.scrollAreaViewport}>
							<Select.Viewport>
								{characters.map((character) => (
									<Select.Item className={styles.characterItem} key={character.class} value={character.class}>
										<CharacterLiberationItem
											character={character}
											isSelected={character.class === selectedCharacter.class}
											onClick={() => setSelectedCharacter(character)}
										/>
									</Select.Item>
								))}
							</Select.Viewport>
						</ScrollArea.Viewport>

						<ScrollArea.Scrollbar className={styles.scrollAreaScrollbar} orientation="vertical">
							<ScrollArea.Thumb className={styles.scrollAreaThumb} />
						</ScrollArea.Scrollbar>
					</ScrollArea.Root>
				</Select.Content>
			</Select.Portal>
		</Select.Root>
	);
};
export default CharacterSelectLiberationDropdown;
