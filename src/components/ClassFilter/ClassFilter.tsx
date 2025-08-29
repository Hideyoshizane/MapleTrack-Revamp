'use client';

import { classFilterCookie } from '@/utils/cookies/classFilterCookie';
import { SkeletonWrapper } from '@components/SkeletonWrapper/SkeletonWrapper';

import styles from './ClassFilter.module.css';

import type { ClassFilterOption } from '@/utils/cookies/classFilterCookie';

interface ClassFilterProps {
	selectedClasses: ClassFilterOption[];
	setSelectedClasses: (values: ClassFilterOption[]) => void;
	loading?: boolean;
}

const toCapitalCase = (str: string) => str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();

// Toggle a class selection. Updates parent state via `setSelectedClasses`
export const ClassFilter = ({ selectedClasses, setSelectedClasses, loading = false }: ClassFilterProps) => {
	const toggleClass = (className: ClassFilterOption) => {
		const lowerName = className.toLowerCase() as ClassFilterOption;

		const updated = selectedClasses.includes(lowerName)
			? selectedClasses.filter((c) => c !== lowerName)
			: [...selectedClasses, lowerName];

		// update parent state & cookie
		setSelectedClasses(updated);
	};

	if (loading) {
		// Show skeleton for entire component

		return (
			<div className={styles.classFilter}>
				<SkeletonWrapper width={1243} height={56} color="light" />
			</div>
		);
	}

	return (
		<div className={styles.classFilter}>
			<h3 className={styles.title}>Class Filter</h3>
			<div className={styles.options}>
				{classFilterCookie['allowedValues'].map((className, index, arr) => {
					const lowerName = className.toLowerCase() as ClassFilterOption;
					return (
						<span key={lowerName} className={styles.optionWrapper}>
							<button
								type="button"
								className={`${styles.option} ${selectedClasses.includes(lowerName) ? styles.active : ''}`}
								onClick={() => toggleClass(lowerName)}>
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
