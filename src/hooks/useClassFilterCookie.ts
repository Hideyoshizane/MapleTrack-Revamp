'use client';

import { useState, useEffect } from 'react';

import { classFilterCookie, type ClassFilterOption } from '@utils/cookies/classFilterCookie';

export const useClassFilterCookie = (): {
	selectedClasses: ClassFilterOption[];
	setClasses: (values: ClassFilterOption[]) => void;
	loading: boolean;
} => {
	// State: array of selected classes
	const [selectedClasses, setSelectedClasses] = useState<ClassFilterOption[]>([]);
	const [loading, setLoading] = useState(true);

	useEffect((): void => {
		const cookieValue = classFilterCookie.get();
		setSelectedClasses(cookieValue ?? []);
		setLoading(false);
	}, []);

	// Update both state and cookie
	const setClasses = (values: ClassFilterOption[]): void => {
		setSelectedClasses(values);
		classFilterCookie.set(values);
	};

	return { selectedClasses, setClasses, loading };
};
