'use client';

import { SessionProvider } from 'next-auth/react';

import type { JSX } from 'react';

interface ProvidersProps {
	children: React.ReactNode;
}

const Providers = ({ children }: ProvidersProps): JSX.Element => {
	return <SessionProvider>{children}</SessionProvider>;
};

export default Providers;
