'use client';

import { ToastContainer, Bounce } from 'react-toastify';

import type { JSX } from 'react';
import type { ToastContainerProps } from 'react-toastify';

import './CustomToaster.scss';

const ClientToaster = (props: ToastContainerProps): JSX.Element => {
	return (
		<ToastContainer
			{...props}
			className="toasterContainer"
			autoClose={4000}
			closeOnClick
			draggable
			hideProgressBar={false}
			newestOnTop
			pauseOnFocusLoss={false}
			pauseOnHover
			toastClassName="toaster"
			transition={Bounce}
		/>
	);
};

export default ClientToaster;
