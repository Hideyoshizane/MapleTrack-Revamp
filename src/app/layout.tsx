import { clsx } from 'clsx';
import { Roboto } from 'next/font/google';
import { cookies } from 'next/headers';

import CustomToaster from '@components/Toaster/Toaster';
import { type Theme } from '@lib/theme';

import Providers from './providers';

import type { JSX } from 'react';

import './globals.scss';

const roboto = Roboto({
	subsets: ['latin'],
	weight: ['300', '400', '500', '700'],
});

const RootLayout = async ({ children }: Readonly<{ children: React.ReactNode }>): Promise<JSX.Element> => {
	const cookieStore = await cookies();
	const theme = (cookieStore.get('theme')?.value ?? 'light') as Theme;

	return (
		<html lang="en">
			<body className={clsx(roboto.className, theme)}>
				<CustomToaster theme={theme} reverseOrder={false} />
				<Providers>
					<main>{children}</main>
				</Providers>
			</body>
		</html>
	);
};

export default RootLayout;
