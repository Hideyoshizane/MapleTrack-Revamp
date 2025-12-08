import { signOut } from 'next-auth/react';
import { useState, useCallback } from 'react';
import { toast } from 'react-toastify';

import type { ApiResponse } from '@sharedTypes/api';

type UseDeleteAccountProps = {
	username: string;
};

type UseDeleteAccountReturn = {
	isDeleteDialogOpen: boolean;
	openDeleteDialog: () => void;
	closeDeleteDialog: () => void;
	handleDelete: () => Promise<void>;
};

export const useDeleteAccount = ({ username }: UseDeleteAccountProps): UseDeleteAccountReturn => {
	const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

	const openDeleteDialog = useCallback((): void => setIsDeleteDialogOpen(true), []);
	const closeDeleteDialog = useCallback((): void => setIsDeleteDialogOpen(false), []);

	const handleDelete = useCallback(async (): Promise<void> => {
		try {
			const response = await fetch('/api/account/delete', {
				method: 'DELETE',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ username }),
			});

			const result = (await response.json()) as ApiResponse;

			if (response.ok && result.success) {
				closeDeleteDialog();
				await signOut({ callbackUrl: `${window.location.origin}/login?accountDeleted=1` });
			} else {
				toast.error(result.message || 'Failed to delete account');
			}
		} catch (error: unknown) {
			const message = error instanceof Error ? error.message : 'Unknown error occurred.';
			toast.error(message);
			console.error('Delete account error:', error);
		}
	}, [username, closeDeleteDialog]);

	return { isDeleteDialogOpen, openDeleteDialog, closeDeleteDialog, handleDelete };
};
