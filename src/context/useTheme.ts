'use client';

import { useContext } from 'react';

import { ThemeContext } from './themeContext';

import type { Theme } from '@sharedTypes/theme';

type ThemeContextProps = {
	theme: Theme;
	setTheme: (value: Theme) => void;
};

export const useTheme = (): ThemeContextProps => {
	// Read the context
	const ctx = useContext(ThemeContext);

	if (!ctx) {
		throw new Error('useTheme must be used within a ThemeProvider');
	}

	return ctx;
};
