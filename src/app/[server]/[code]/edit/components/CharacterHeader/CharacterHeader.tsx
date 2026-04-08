'use client';
import { useRouter, usePathname } from 'next/navigation';
import { toast } from 'react-toastify';

import Button from '@components/Button/Button';
import Tooltip from '@components/Tooltip/Tooltip';
import { characterApi } from '@features/character/characterApi';
import { sanitizeInputFrontend } from '@utils/sanitizeInputFrontEnd';

import styles from './CharacterHeader.module.scss';

import type { updateCharacterRequestBody } from '@features/character/schemas/character.request.schema';
import type { getEditCharacterDataResponseBody } from '@features/character/schemas/character.response.schema';
import type { JSX } from 'react';

type Props = {
	character?: getEditCharacterDataResponseBody;
	server: string;
	nameError: string | null;
	submitLoading: boolean;
	setSubmitLoading: (value: boolean) => void;
	onDiscard: () => void;
};
export const CharacterHeader = ({
	character,
	server,
	nameError,
	submitLoading,
	setSubmitLoading,
	onDiscard,
}: Props): JSX.Element => {
	const router = useRouter();
	const pathname = usePathname();

	const onSubmit = async (): Promise<void> => {
		if (!character) {
			return;
		}

		try {
			setSubmitLoading(true);
			const payload: updateCharacterRequestBody = { ...character, server: sanitizeInputFrontend(server) };
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
			<Button className={styles.discardButton} onClick={onDiscard}>
				Discard Changes
			</Button>
			<Tooltip content="Please input a valid character name." placement="bottom" enabled={Boolean(nameError)}>
				<Button
					className={styles.saveChangesButton}
					disabled={Boolean(nameError)}
					isLoading={submitLoading}
					loaderSize={16}
					loaderColor="#121212"
					loaderBorderWidth={3}
					onClick={(): void => {
						void onSubmit();
					}}>
					Save Changes
				</Button>
			</Tooltip>
		</div>
	);
};
