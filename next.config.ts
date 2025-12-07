import withBundleAnalyzer from '@next/bundle-analyzer';

import type { NextConfig } from 'next';
import type { RemotePattern } from 'next/dist/shared/lib/image-config';

const patterns: RemotePattern[] = [
	{
		protocol: 'https',
		hostname: 'www.nexon.com',
		pathname: '/api/maplestory/**',
		port: '',
		search: '',
	},
	{
		protocol: 'https',
		hostname: 'msavatar1.nexon.net',
		pathname: '/Character/**',
		port: '',
		search: '',
	},
];

const nextConfig: NextConfig = {
	turbopack: {
		rules: {
			'*.svg': {
				loaders: [
					{
						loader: '@svgr/webpack',
						options: {
							exportType: 'default',

							// Remove width/height from all SVGs so CSS can always control size
							dimensions: false,

							// Normalize SVGs so they scale infinitely with CSS
							svgProps: {
								width: '100%',
								height: '100%',
								preserveAspectRatio: 'xMidYMid meet',
							},
						},
					},
				],
				as: '*.ts',
			},
		},
	},

	images: {
		remotePatterns: patterns,
		qualities: [75, 100],
	},
};

export default withBundleAnalyzer({
	enabled: process.env.ANALYZE === 'true',
})(nextConfig);
