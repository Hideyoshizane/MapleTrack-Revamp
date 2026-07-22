'use client';
import { useRouter, usePathname } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'react-toastify';

import Button from '@components/Button/Button';
import Tooltip from '@components/Tooltip/Tooltip';
import { characterApi } from '@features/character/characterApi';
import { sanitizeInput } from '@utils/sanitizeInput';

import styles from './CharacterHeader.module.scss';

import type { updateCharacterRequestBody } from '@features/character/schemas/character.request.schema';
import type { getEditCharacterDataResponseBody } from '@features/character/schemas/character.response.schema';
import type { JSX } from 'react';

type Props = {
	character?: getEditCharacterDataResponseBody;
	server: string;
	nameError: string | null;
};

export const CharacterHeader = ({ character, server, nameError }: Props): JSX.Element => {
	const [submitLoading, setSubmitLoading] = useState(false);

	const router = useRouter();
	const pathname = usePathname();

	const handleDiscard = (): void => {
		router.push(pathname.replace(/\/edit$/, ''));
	};

	const onSubmit = async (): Promise<void> => {
		if (!character) {
			return;
		}

		try {
			setSubmitLoading(true);
			const payload: updateCharacterRequestBody = { ...character, server: sanitizeInput(server) };
			const result = await characterApi.updateCharacterData(payload);

			if (result.success) {
				const basePath = pathname.replace(/\/edit$/, '');
				router.push(`${basePath}?success=1`);
			} else {
				toast.error(result.message || 'Failed to update the character');
			}
		} catch (err) {
			console.error(err);
			toast.error('Unexpected error occurred');
		} finally {
			setSubmitLoading(false);
		}
	};

	return (
		<div className={styles.buttonLine}>
			<Button className={styles.discardButton} onClick={handleDiscard}>
				Discard Changes
			</Button>
			<Tooltip content="Please input a valid character name." enabled={Boolean(nameError)} placement="bottom">
				<Button
					className={styles.saveChangesButton}
					disabled={Boolean(nameError)}
					isLoading={submitLoading}
					loaderBorderWidth={3}
					loaderColor="#121212"
					loaderSize={16}
					onClick={(): void => {
						void onSubmit();
					}}
				>
					Save Changes
				</Button>
			</Tooltip>
		</div>
	);
};
