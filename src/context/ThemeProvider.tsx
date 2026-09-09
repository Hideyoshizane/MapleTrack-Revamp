'use client';

import { useEffect, useState } from 'react';

import { ThemeContext } from './ThemeContext';

import type { Theme } from '@sharedTypes/theme';
import type { JSX, ReactNode } from 'react';

const getInitialTheme = (): Theme => {
	if (typeof window === 'undefined') {
		return 'dark';
	}

	const stored = localStorage.getItem('theme') as Theme | null;

	if (stored) {
		return stored;
	}

	const domTheme = document.documentElement.dataset.theme as Theme | undefined;

	if (domTheme) {
		return domTheme;
	}

	return 'dark';
};

export const ThemeProvider = ({ children }: { children: ReactNode }): JSX.Element => {
	const [theme, setTheme] = useState<Theme>(getInitialTheme);

	useEffect(() => {
		document.documentElement.dataset.theme = theme;
		localStorage.setItem('theme', theme);
	}, [theme]);

	return <ThemeContext.Provider value={{ theme, setTheme }}>{children}</ThemeContext.Provider>;
};
