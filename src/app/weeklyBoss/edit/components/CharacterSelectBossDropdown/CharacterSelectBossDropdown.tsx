'use client';

import * as Select from '@radix-ui/react-select';
import Image from 'next/image';

import MenuIcon from '@assets/svg/menu.svg';
import { generateClassCode } from '@data/classes/classes';

import CharacterBossItem from './BossItem/CharacterBossItem';
import styles from './CharacterSelectBossDropdown.module.scss';

import type { getEditBossListCharacterResponseBody } from '@features/boss/schemas/bossList.response.schema';
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
			onValueChange={(value): void => {
				const found = characters.find((c) => c.class === value);
				if (found) {
					setSelectedCharacter(found);
				}
			}}
			value={selectedCharacter.class}
		>
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
					<div className={styles.scrollContainer}>
						<Select.Viewport>
							{characters.map((character) => (
								<Select.Item
									className={styles.characterItem}
									key={character.class}
									value={character.class}
								>
									<CharacterBossItem
										character={character}
										isSelected={character.class === selectedCharacter.class}
										onClick={() => setSelectedCharacter(character)}
									/>
								</Select.Item>
							))}
						</Select.Viewport>
					</div>
				</Select.Content>
			</Select.Portal>
		</Select.Root>
	);
};
export default CharacterSelectBossDropdown;
