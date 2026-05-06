import { Suspense } from 'react';

import ForceLogoutClient from './ForceLogoutClient';

import type { JSX } from 'react';

const ForceLogoutPage = (): JSX.Element => {
	return (
		<Suspense fallback={null}>
			<ForceLogoutClient />
		</Suspense>
	);
};

export default ForceLogoutPage;
