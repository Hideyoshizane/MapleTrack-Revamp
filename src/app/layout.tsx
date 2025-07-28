import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import { Roboto } from 'next/font/google';

import CustomToaster from '@components/Toaster/Toaster';
import { type Theme } from '@/lib/theme';
import clsx from 'clsx';

import './globals.css';

const roboto = Roboto({
	subsets: ['latin'],
	weight: ['300', '400', '500', '700'],
});

export const metadata: Metadata = {
	title: 'MapleTrack',
	icons: {
		icon: '/favicon.ico',
		apple: '/apple-icon.png',
		shortcut: '/favicon.ico',
	},
	manifest: '/manifest.json',
};

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
	const cookieStore = await cookies();
	const theme = (cookieStore.get('theme')?.value ?? 'light') as Theme;
	return (
		<html lang="en">
			<body className={clsx(roboto.className, theme)}>
				<CustomToaster theme={theme} reverseOrder={false} />
				<main>{children}</main>
			</body>
		</html>
	);
}
