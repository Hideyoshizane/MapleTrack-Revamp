'use client';

import * as AlertDialog from '@radix-ui/react-alert-dialog';
import React from 'react';

import styles from './AlertDialogComponent.module.css';

interface AlertDialogComponentProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onConfirm: () => Promise<void> | void;
}

export default function AlertDialogComponent({ open, onOpenChange, onConfirm }: AlertDialogComponentProps) {
	return (
		<AlertDialog.Root open={open} onOpenChange={onOpenChange}>
			<AlertDialog.Portal>
				<AlertDialog.Overlay className={styles.overlay} />
				<AlertDialog.Content className={styles.content} aria-describedby="alert-dialog-description">
					<AlertDialog.Title className={styles.title}>{'Are you absolutely sure?'}</AlertDialog.Title>

					<AlertDialog.Description id="alert-dialog-description" className={styles.description}>
						This action cannot be undone. This will permanently delete your account and remove your data from our
						servers.
					</AlertDialog.Description>

					<div className={styles.buttonDiv}>
						<AlertDialog.Cancel asChild>
							<button className={styles.cancelButton}>Cancel</button>
						</AlertDialog.Cancel>
						<AlertDialog.Action asChild>
							<button
								className={styles.dangerButton}
								onClick={() => {
									void (async () => {
										try {
											await onConfirm();
											onOpenChange(false);
										} catch (error) {
											console.error('Error on confirm:', error);
										}
									})();
								}}>
								Yes, delete account
							</button>
						</AlertDialog.Action>
					</div>
				</AlertDialog.Content>
			</AlertDialog.Portal>
		</AlertDialog.Root>
	);
}
