'use client';

import { ToastContainer, Bounce } from 'react-toastify';

import type { JSX } from 'react';
import type { ToastContainerProps } from 'react-toastify';

import 'react-toastify/dist/ReactToastify.css';

const ClientToaster = (props: ToastContainerProps): JSX.Element => {
	return (
		<ToastContainer
			{...props}
			autoClose={4000}
			hideProgressBar={false}
			newestOnTop={false}
			closeOnClick
			pauseOnHover
			draggable
			pauseOnFocusLoss={false}
			transition={Bounce}
		/>
	);
};

export default ClientToaster;
