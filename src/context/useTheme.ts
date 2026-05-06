'use client';

import { useContext } from 'react';

import { ThemeContext } from './ThemeContext';

import type { Theme } from '@sharedTypes/theme';

type Props = {
	theme: Theme;
	setTheme: (value: Theme) => void;
};

export const useTheme = (): Props => {
	// Read the context
	const ctx = useContext(ThemeContext);

	if (!ctx) {
		throw new Error('useTheme must be used within a ThemeProvider');
	}

	return ctx;
};
