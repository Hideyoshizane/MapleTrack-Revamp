import { useSearchParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';

type ToastMessages = { [key: string]: { message: string; type: 'success' | 'error' } };

const TOAST_MESSAGES: ToastMessages = {
	success: { message: 'Account created! Please log in.', type: 'success' },
	reset: { message: 'Reset password successfully! Please log in.', type: 'success' },
	unauthorized: { message: 'You must be logged in to access that page.', type: 'error' },
	accountDeleted: { message: 'Account deleted successfully.', type: 'success' },
	version_update: { message: 'Please log again to update.', type: 'success' },
};

export const useToastQueryParams = (): void => {
	const searchParams = useSearchParams();
	const router = useRouter();
	const [hasShownToast, setHasShownToast] = useState(false);

	useEffect((): void => {
		if (hasShownToast) return;

		for (const [param, { message, type: toastType }] of Object.entries(TOAST_MESSAGES)) {
			if (searchParams.get(param) === '1') {
				if (toastType === 'success') {
					toast.success(message);
				} else {
					toast.error(message);
				}

				queueMicrotask(() => {
					setHasShownToast(true);
				});
				router.replace('/login');
				break;
			}
		}
	}, [searchParams, hasShownToast, router]);
};
