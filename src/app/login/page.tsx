'use client';
import { useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';

export default function LoginPage() {
	const searchParams = useSearchParams();
	const router = useRouter();

	useEffect(() => {
		const success = searchParams.get('success');
		if (success === '1') {
			toast.success('Account created! Please log in.');
			router.replace('/login');
		}
	}, [searchParams, router]);

	return <main>{/* your login form here */}</main>;
}
