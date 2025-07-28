import React from 'react';
import { Toaster } from 'react-hot-toast';

type CustomToasterProps = {
	theme: 'light' | 'dark'; // Current theme of the application
	reverseOrder?: boolean;
};
// Define custom styles for each theme
const toastStyles = {
	light: {
		style: {
			background: '#EDEDED',
			color: '#212121',
			borderRadius: '10px',
			fontSize: '1.25rem',
		},
	},
	dark: {
		style: {
			background: '#3D3D3D',
			color: '#EDEDED',
			borderRadius: '10px',
			fontSize: '1.25rem',
		},
	},
};

export default function CustomToaster({ theme, reverseOrder = false }: CustomToasterProps) {
	// Invert the theme so the toast stands out from the page background
	const invertedTheme = theme === 'light' ? 'dark' : 'light';

	return (
		<Toaster
			position="top-center"
			reverseOrder={reverseOrder}
			toastOptions={{
				...toastStyles[invertedTheme],
			}}
		/>
	);
}
