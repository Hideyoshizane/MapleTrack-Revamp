'use client';

import Skeleton from '@mui/material/Skeleton';
import React from 'react';

interface SkeletonWrapperProps {
	width: number;
	height: number;
	color: 'light' | 'dark';
	variant?: 'text' | 'rectangular' | 'rounded' | 'circular';
}

// Predefined background colors
const SkeletonBgColors = {
	light: 'rgba(0,0,0,0.3)',
	dark: 'rgba(255,255,255,0.6)',
};

export const SkeletonWrapper = ({ width, height, color, variant = 'text' }: SkeletonWrapperProps) => {
	return (
		<Skeleton
			width={width}
			height={height}
			animation="wave"
			variant={variant}
			sx={{ bgcolor: SkeletonBgColors[color], borderRadius: 4 }}
		/>
	);
};
