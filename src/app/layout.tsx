import { clsx } from 'clsx';
import { Roboto } from 'next/font/google';
import { cookies } from 'next/headers';

import ClientToaster from '@components/CustomToaster/CustomToaster';
import { type Theme } from '@lib/config/theme';

import Providers from './providers';

import type { JSX } from 'react';

import './globals.scss';

const roboto = Roboto({
	subsets: ['latin'],
	weight: ['300', '400', '500', '600', '700'],
});

const RootLayout = async ({ children }: Readonly<{ children: React.ReactNode }>): Promise<JSX.Element> => {
	const cookieStore = await cookies();
	const theme = (cookieStore.get('theme')?.value ?? 'light') as Theme;

	return (
		<html lang="en">
			<body className={clsx(roboto.className, theme)}>
				<Providers>
					<ClientToaster position="top-right" rtl={false} theme="dark" />
					<main>{children}</main>
				</Providers>
			</body>
		</html>
	);
};

export default RootLayout;
