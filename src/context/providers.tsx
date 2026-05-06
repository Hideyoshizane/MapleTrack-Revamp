'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { usePathname } from 'next/navigation';
import { SessionProvider } from 'next-auth/react';
import { useEffect, useState } from 'react';

import { ThemeProvider } from '@context/ThemeContext';
import { useTheme } from '@context/useTheme';
import { isPublicPath } from '@lib/config/access';

import type { JSX, ReactNode } from 'react';

type ProvidersProps = {
	children: ReactNode;
};

const RouteThemeHandler = (): JSX.Element | null => {
	const pathname = usePathname();
	const { setTheme, theme } = useTheme();

	useEffect(() => {
		const isPublic = isPublicPath(pathname);

		const routeTheme = isPublic ? 'dark' : 'light';

		// Only update if theme is different
		if (routeTheme !== theme) {
			setTheme(routeTheme);
		}
	}, [pathname, setTheme, theme]);

	return null;
};

const Providers = ({ children }: ProvidersProps): JSX.Element => {
	const [queryClient] = useState(
		(): QueryClient =>
			new QueryClient({
				defaultOptions: { queries: { refetchOnWindowFocus: false, staleTime: 30 * 1000, retry: 1 } },
			}),
	);
	return (
		<SessionProvider>
			<QueryClientProvider client={queryClient}>
				<ThemeProvider>
					<RouteThemeHandler />
					{children}
				</ThemeProvider>
			</QueryClientProvider>
		</SessionProvider>
	);
};

export default Providers;
