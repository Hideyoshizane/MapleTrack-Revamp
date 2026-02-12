import { signOut } from 'next-auth/react';
import { useState } from 'react';
import { toast } from 'react-toastify';

import { userApi } from '@features/user/userApi';

type UseDeleteAccountReturn = {
	isDeleteDialogOpen: boolean;
	openDeleteDialog: () => void;
	closeDeleteDialog: () => void;
	handleDelete: () => Promise<void>;
};

export const useDeleteAccount = (): UseDeleteAccountReturn => {
	const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

	const openDeleteDialog = (): void => {
		setIsDeleteDialogOpen(true);
	};

	const closeDeleteDialog = (): void => {
		setIsDeleteDialogOpen(false);
	};

	const handleDelete = async (): Promise<void> => {
		try {
			const result = await userApi.deleteAccount();

			if (!result.success) {
				toast.error(result.message ?? 'Failed to delete account');
				return;
			}

			// Close dialog before signing out
			closeDeleteDialog();

			await signOut({ callbackUrl: '/login?accountDeleted=1' });
		} catch (error: unknown) {
			const message = error instanceof Error ? error.message : 'Unknown error occurred.';
			toast.error(message);
			console.error('Delete account error:', error);
		}
	};

	return { isDeleteDialogOpen, openDeleteDialog, closeDeleteDialog, handleDelete };
};
