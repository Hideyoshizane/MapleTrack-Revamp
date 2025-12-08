'use client';

import { clsx } from 'clsx';
import { useRef, useState, useEffect } from 'react';

import styles from './ResponsiveText.module.scss';

import type { JSX, ReactNode } from 'react';

type ResponsiveTextProps = {
	children: ReactNode;
	width: number;
	height: number;
	className?: string;
	maxFontSize: number;
	minFontSize: number;
};

const ResponsiveText = ({
	children,
	width,
	height,
	className,
	maxFontSize,
	minFontSize,
}: ResponsiveTextProps): JSX.Element => {
	const ref = useRef<HTMLParagraphElement>(null);
	const [fontSize, setFontSize] = useState<number>(maxFontSize);

	useEffect((): void => {
		if (!ref.current) {
			return;
		}

		const element = ref.current;
		let size = maxFontSize;
		element.style.fontSize = `${size}px`;

		const maxHeight = height; // allow up to 2 lines
		while ((element.scrollWidth > width || element.scrollHeight > maxHeight) && size > minFontSize) {
			size -= 1;
			element.style.fontSize = `${size}px`;
		}

		queueMicrotask(() => {
			setFontSize(size);
		});
	}, [children, width, height, maxFontSize, minFontSize]);

	return (
		<div className={clsx(styles.wrapper, className)} style={{ width: `${width}px`, height: `${height}px` }}>
			<p
				ref={ref}
				className={styles.text}
				style={{
					fontSize,
					display: '-webkit-box',
					WebkitLineClamp: 2,
					WebkitBoxOrient: 'vertical',
					overflow: 'hidden',
				}}>
				{children}
			</p>
		</div>
	);
};

export default ResponsiveText;
