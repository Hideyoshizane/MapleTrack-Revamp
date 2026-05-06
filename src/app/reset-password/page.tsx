import { use } from 'react';

import ResetPasswordClient from './ResetPasswordClient';

import type { JSX } from 'react';

type Props = {
	searchParams: Promise<{ token?: string }>;
};

const ResetPasswordPage = ({ searchParams }: Props): JSX.Element => {
	const params = use(searchParams);
	const token = params.token ?? '';

	return <ResetPasswordClient token={token} />;
};

export default ResetPasswordPage;
