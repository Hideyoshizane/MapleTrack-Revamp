'use client';

import clsx from 'clsx';

import styles from './SkeletonWrapper.module.scss';

import type { JSX } from 'react';

type SkeletonWrapperProps = {
	width: number | string;
	height: number | string;
	color: 'light' | 'dark';
	variant?: 'text' | 'rectangular' | 'rounded' | 'circular';
};

// Mapeia os backgrounds
const SkeletonBgColors: Record<SkeletonWrapperProps['color'], string> = {
	light: 'rgba(0,0,0,0.3)',
	dark: 'rgba(255,255,255,0.6)',
};
void styles.text;
void styles.rectangular;
void styles.rounded;
void styles.circular;

// O componente final substitui totalmente o MUI Skeleton
export const SkeletonWrapper = ({
	width,
	height,
	color,
	variant = 'rectangular',
}: SkeletonWrapperProps): JSX.Element => {
	return (
		// Aplica classes e estilos de tamanho diretamente
		<div
			className={clsx(styles.skeleton, styles[variant])}
			style={{
				width,
				height,
				backgroundColor: SkeletonBgColors[color],
			}}
		/>
	);
};
