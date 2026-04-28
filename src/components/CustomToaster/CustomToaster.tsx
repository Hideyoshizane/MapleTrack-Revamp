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
			closeOnClick
			draggable
			hideProgressBar={false}
			newestOnTop={false}
			pauseOnFocusLoss={false}
			pauseOnHover
			transition={Bounce}
		/>
	);
};

export default ClientToaster;
