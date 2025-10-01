import { signOut } from 'next-auth/react';
import { useState, useCallback } from 'react';
import { toast } from 'react-hot-toast';

import type { ApiResponse } from '@sharedTypes/api';

interface UseDeleteAccountProps {
	username: string;
}

interface UseDeleteAccountReturn {
	isDeleteDialogOpen: boolean;
	openDeleteDialog: () => void;
	closeDeleteDialog: () => void;
	handleDelete: () => Promise<void>;
}

export const useDeleteAccount = ({ username }: UseDeleteAccountProps): UseDeleteAccountReturn => {
	const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

	const openDeleteDialog = useCallback((): void => setIsDeleteDialogOpen(true), []);
	const closeDeleteDialog = useCallback((): void => setIsDeleteDialogOpen(false), []);

	const handleDelete = useCallback(async (): Promise<void> => {
		try {
			console.log(username);
			const response = await fetch('/api/account/delete', {
				method: 'DELETE',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ username }),
			});

			const result = (await response.json()) as ApiResponse;

			if (response.ok && result.success) {
				await signOut({ callbackUrl: `${window.location.origin}/login?accountDeleted=1` });
				closeDeleteDialog();
			} else if (!result.success) {
				toast.error(result.error || 'Failed to delete account');
			}
		} catch (error: unknown) {
			if (error instanceof Error) {
				toast.error(error.message);
				console.error('Delete account error:', error);
			} else {
				toast.error('Unknown error occurred.');
			}
		}
	}, [username, closeDeleteDialog]);

	return { isDeleteDialogOpen, openDeleteDialog, closeDeleteDialog, handleDelete };
};
