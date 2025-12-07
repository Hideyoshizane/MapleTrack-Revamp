'use client';
import { useRouter, usePathname } from 'next/navigation';
import { toast } from 'react-toastify';

import Button from '@components/Button/Button';
import Tooltip from '@components/Tooltip/Tooltip';
import { updateCharacterData } from '@service/characterService';
import { sanitizeInputFrontend } from '@utils/sanitize/sanitizeInputFrontEnd';

import styles from './CharacterHeader.module.scss';

import type { UpdateCharacterRequestBody, Character } from '@/shared/types/character';
import type { ApiResponse } from '@sharedTypes/api';
import type { JSX } from 'react';

interface Props {
	character?: Character;
	userOrigin: string;
	server: string;
	code: string;
	nameError: string | null;
	submitLoading: boolean;
	setSubmitLoading: (value: boolean) => void;
	onDiscard: () => void;
}
export const CharacterHeader = ({
	character,
	userOrigin,
	server,
	code,
	nameError,
	submitLoading,
	setSubmitLoading,
	onDiscard,
}: Props): JSX.Element => {
	const router = useRouter();
	const pathname = usePathname();

	const onSubmit = async (): Promise<void> => {
		if (!character) return;

		try {
			setSubmitLoading(true);
			const payload: UpdateCharacterRequestBody = {
				userOrigin: sanitizeInputFrontend(userOrigin),
				server: sanitizeInputFrontend(server),
				code: sanitizeInputFrontend(code),
				data: character,
			};
			const result: ApiResponse = await updateCharacterData(payload);

			if (result.success) {
				const basePath = pathname.replace(/\/edit$/, '');
				router.push(`${basePath}?success=1`);
			} else {
				toast.error(result.error || 'Failed to update the character');
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
