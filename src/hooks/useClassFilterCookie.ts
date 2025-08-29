'use client';

import { useState, useEffect } from 'react';

import { classFilterCookie } from '@/utils/cookies/classFilterCookie';

import type { ClassFilterOption } from '@/utils/cookies/classFilterCookie';

export const useClassFilterCookie = () => {
	// State: array of selected classes
	const [selectedClasses, setSelectedClasses] = useState<ClassFilterOption[]>([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const cookieValue = classFilterCookie.get();
		setSelectedClasses(cookieValue ?? []);
		setLoading(false);
	}, []);

	// Update both state and cookie
	const setClasses = (values: ClassFilterOption[]) => {
		setSelectedClasses(values);
		classFilterCookie.set(values);
	};

	return { selectedClasses, setClasses, loading };
};
