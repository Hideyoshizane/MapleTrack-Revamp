import { createContext } from 'react';

import type { Theme } from '@sharedTypes/theme';

type ThemeContextType = {
	theme: Theme;
	setTheme: (value: Theme) => void;
};

export const ThemeContext = createContext<ThemeContextType | null>(null);
