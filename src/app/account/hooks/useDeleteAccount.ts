import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';

import { userApi } from '@features/user/userApi';
import { authClient } from '@lib/authClient';

type UseDeleteAccountReturn = {
	isDeleteDialogOpen: boolean;
	openDeleteDialog: () => void;
	closeDeleteDialog: () => void;
	handleDelete: () => Promise<void>;
};

export const useDeleteAccount = (): UseDeleteAccountReturn => {
	const router = useRouter();
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

			await authClient.signOut({
				fetchOptions: {
					onSuccess: () => {
						router.push('/login?accountDeleted=1');
					},
				},
			});
		} catch (error: unknown) {
			const message = error instanceof Error ? error.message : 'Unknown error occurred.';

			toast.error(message);
			console.error('Delete account error:', error);
		}
	};

	return { isDeleteDialogOpen, openDeleteDialog, closeDeleteDialog, handleDelete };
};
