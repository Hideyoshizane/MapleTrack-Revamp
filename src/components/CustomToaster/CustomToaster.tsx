'use client';

import { Toaster } from 'sonner';

import type { JSX } from 'react';
import type { ToasterProps } from 'sonner';

import './CustomToaster.scss';

const ClientToaster = (props: ToasterProps): JSX.Element => {
	return (
		<Toaster
			{...props}
			className="toasterContainer"
			closeButton={true}
			expand={false}
			duration={2500}
			position="bottom-right"
			toastOptions={{
				...props.toastOptions,
				classNames: { ...props.toastOptions?.classNames, toast: 'toaster' },
			}}
		/>
	);
};

export default ClientToaster;
