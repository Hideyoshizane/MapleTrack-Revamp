import withBundleAnalyzer from '@next/bundle-analyzer';

import type { NextConfig } from 'next';
import type { RemotePattern } from 'next/dist/shared/lib/image-config';

const patterns: RemotePattern[] = [
	{
		hostname: 'www.nexon.com',
		pathname: '/api/maplestory/**',
		port: '',
		protocol: 'https',
		search: '',
	},
	{
		hostname: 'msavatar1.nexon.net',
		pathname: '/Character/**',
		port: '',
		protocol: 'https',
		search: '',
	},
];

const nextConfig: NextConfig = {
	images: { qualities: [75, 100], remotePatterns: patterns },
	turbopack: {
		rules: {
			'*.svg': {
				as: '*.tsx',
				loaders: [
					{
						loader: '@svgr/webpack',
						options: {
							// Remove width/height from all SVGs so CSS can always control size
							dimensions: false,

							exportType: 'default',
						},
					},
				],
			},
		},
	},
};

export default withBundleAnalyzer({
	enabled: process.env.ANALYZE === 'true',
})(nextConfig);
