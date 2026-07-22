import { clsx } from 'clsx';
import { Roboto } from 'next/font/google';

import ClientToaster from '@components/CustomToaster/CustomToaster';

import Providers from '../context/Providers';

import type { Metadata } from 'next';
import type { JSX } from 'react';

import '../styles/Globals.scss';

export const metadata: Metadata = {
	title: 'MapleTrack',
	icons: { icon: '/favicon.ico', apple: '/apple-icon.png', shortcut: '/favicon.ico' },
	manifest: '/manifest.json',
};

const roboto = Roboto({ subsets: ['latin'], weight: ['300', '400', '500', '600', '700'], display: 'swap' });

const RootLayout = ({ children }: Readonly<{ children: React.ReactNode }>): JSX.Element => {
	return (
		<html lang="en">
			<body className={clsx(roboto.className)}>
				<Providers>
					<ClientToaster position="bottom-right" rtl={false} theme="dark" />

					<main>{children}</main>
				</Providers>
			</body>
		</html>
	);
};

export default RootLayout;
