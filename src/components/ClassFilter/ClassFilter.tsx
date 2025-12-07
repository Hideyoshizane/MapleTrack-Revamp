'use client';

import { SkeletonWrapper } from '@components/SkeletonWrapper/SkeletonWrapper';
import { classFilterOptions } from '@utils/cookies/classFilterCookie';

import styles from './ClassFilter.module.scss';

import type { ClassFilterOption } from '@utils/cookies/classFilterCookie';
import type { JSX } from 'react';

interface ClassFilterProps {
	selectedClasses: ClassFilterOption[];
	setSelectedClasses: (values: ClassFilterOption[]) => void;
	loading?: boolean;
}

const toCapitalCase = (str: string): string => str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();

// Toggle a class selection. Updates parent state via `setSelectedClasses`
export const ClassFilter = ({
	selectedClasses,
	setSelectedClasses,
	loading = false,
}: ClassFilterProps): JSX.Element => {
	const toggleClass = (className: ClassFilterOption): void => {
		const lowerName = className.toLowerCase() as ClassFilterOption;

		const updated = selectedClasses.includes(lowerName)
			? selectedClasses.filter((c): boolean => c !== lowerName)
			: [...selectedClasses, lowerName];

		// update parent state & cookie
		setSelectedClasses(updated);
	};

	if (loading) {
		// Show skeleton for entire component
		return (
			<div className={styles.classFilter}>
				<SkeletonWrapper width={1243} height={56} color="light" variant="rounded" />
			</div>
		);
	}

	return (
		<div className={styles.classFilter}>
			<h3 className={styles.title}>Class Filter</h3>
			<div className={styles.options}>
				{classFilterOptions.map((className, index, arr): JSX.Element => {
					const lowerName = className.toLowerCase() as ClassFilterOption;
					return (
						<span key={lowerName} className={styles.optionWrapper}>
							<button
								type="button"
								className={`${styles.option} ${selectedClasses.includes(lowerName) ? styles.active : ''}`}
								onClick={(): void => toggleClass(lowerName)}>
								{toCapitalCase(lowerName)}
							</button>
							{index < arr.length - 1 && <span className={styles.separator}></span>}
						</span>
					);
				})}
			</div>
		</div>
	);
};
