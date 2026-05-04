'use client';

import { SkeletonWrapper } from '@components/SkeletonWrapper/skeletonWrapper';
import { classFilterOptions } from '@utils/classFilterCookie';

import styles from './classFilter.module.scss';

import type { ClassFilterOption } from '@utils/classFilterCookie';
import type { JSX } from 'react';

type Props = {
	selectedClasses: ClassFilterOption[];
	setSelectedClasses: (values: ClassFilterOption[]) => void;
	loading?: boolean;
};

const toCapitalCase = (str: string): string => str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();

export const ClassFilter = ({ selectedClasses, setSelectedClasses, loading = false }: Props): JSX.Element => {
	const toggleClass = (className: ClassFilterOption): void => {
		const lowerName = className.toLowerCase() as ClassFilterOption;

		const updated = selectedClasses.includes(lowerName)
			? selectedClasses.filter((c): boolean => c !== lowerName)
			: [...selectedClasses, lowerName];

		setSelectedClasses(updated);
	};

	if (loading) {
		return (
			<div className={styles.classFilter}>
				<SkeletonWrapper color="light" height={56} variant="rounded" width={1243} />
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
						<span className={styles.optionWrapper} key={lowerName}>
							<button
								className={`${styles.option} ${selectedClasses.includes(lowerName) ? styles.active : ''}`}
								onClick={(): void => toggleClass(lowerName)}
								type="button">
								{toCapitalCase(lowerName)}
							</button>
							{index < arr.length - 1 && <span className={styles.separator} />}
						</span>
					);
				})}
			</div>
		</div>
	);
};
