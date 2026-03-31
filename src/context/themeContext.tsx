'use client';

import { createContext, useState, useCallback, useEffect } from 'react';

import type { Theme } from '@sharedTypes/theme';
import type { JSX, ReactNode } from 'react';

type ThemeContextProps = {
	theme: Theme;
	setTheme: (value: Theme) => void;
};

const ThemeContext = createContext<ThemeContextProps | null>(null);

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
	const [theme, setThemeState] = useState<Theme>(getInitialTheme);

	useEffect(() => {
		document.documentElement.dataset.theme = theme;
		localStorage.setItem('theme', theme);
	}, [theme]);

	const setTheme = useCallback((value: Theme): void => {
		setThemeState(value);
	}, []);

	return <ThemeContext.Provider value={{ theme, setTheme }}>{children}</ThemeContext.Provider>;
};

export { ThemeContext };
