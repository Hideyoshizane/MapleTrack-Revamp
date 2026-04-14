'use client';

import * as ScrollArea from '@radix-ui/react-scroll-area';
import * as Select from '@radix-ui/react-select';
import Image from 'next/image';

import MenuIcon from '@assets/svg/menu.svg';
import { generateClassCode } from '@data/classes/classes';

import CharacterBossItem from './BossItem/characterBossItem';
import styles from './characterSelectBossDropdown.module.scss';

import type { getEditBossListCharacterResponseBody } from '@features/Boss/schemas/bossList.response.schema';
import type { JSX } from 'react';

type Props = {
	setSelectedCharacter: (value: getEditBossListCharacterResponseBody) => void;
	selectedCharacter: getEditBossListCharacterResponseBody | null;
	characters: getEditBossListCharacterResponseBody[];
};

const CharacterSelectBossDropdown = ({ setSelectedCharacter, selectedCharacter, characters }: Props): JSX.Element => {
	if (!selectedCharacter) {
		return <div />;
	}

	const code = generateClassCode(selectedCharacter.class);

	return (
		<Select.Root
			value={selectedCharacter.class}
			onValueChange={(value): void => {
				const found = characters.find((c) => c.class === value);
				if (found) {
					setSelectedCharacter(found);
				}
			}}>
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
					src={`/assets/buttom_profile/${code}.webp`}
					alt={selectedCharacter.name}
					width={480}
					height={80}
					priority
				/>
			</Select.Trigger>

			<Select.Portal>
				<Select.Content className={styles.characterList} position="popper">
					<ScrollArea.Root className={styles.scrollAreaRoot} type="auto">
						<ScrollArea.Viewport className={styles.scrollAreaViewport}>
							<Select.Viewport>
								{characters.map((character) => (
									<Select.Item key={character.class} value={character.class} className={styles.characterItem}>
										<CharacterBossItem
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
export default CharacterSelectBossDropdown;
