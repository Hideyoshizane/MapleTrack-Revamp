'use client';

import * as AlertDialog from '@radix-ui/react-alert-dialog';

import styles from './alertDialogComponent.module.scss';

import type { JSX } from 'react';

type Props = {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onConfirm: () => Promise<void> | void;
};

const AlertDialogComponent = ({ open, onOpenChange, onConfirm }: Props): JSX.Element => {
	const handleConfirm = async (): Promise<void> => {
		try {
			await onConfirm();
			onOpenChange(false);
		} catch (error) {
			console.error('Error on confirm:', error);
		}
	};

	return (
		<AlertDialog.Root onOpenChange={onOpenChange} open={open}>
			<AlertDialog.Portal>
				<AlertDialog.Overlay className={styles.overlay} />
				<AlertDialog.Content className={styles.content}>
					<AlertDialog.Title className={styles.title}>Are you absolutely sure?</AlertDialog.Title>

					<AlertDialog.Description className={styles.description}>
						This action cannot be undone. This will permanently delete your account and remove your data from our
						servers.
					</AlertDialog.Description>

					<div className={styles.buttonDiv}>
						<AlertDialog.Cancel asChild>
							<button className={styles.cancelButton}>Cancel</button>
						</AlertDialog.Cancel>

						{/* Confirm button */}
						<AlertDialog.Action asChild>
							<button
								className={styles.dangerButton}
								onClick={(): void => {
									void handleConfirm();
								}}>
								Yes, delete account
							</button>
						</AlertDialog.Action>
					</div>
				</AlertDialog.Content>
			</AlertDialog.Portal>
		</AlertDialog.Root>
	);
};

export default AlertDialogComponent;
