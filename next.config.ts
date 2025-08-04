import withBundleAnalyzer from '@next/bundle-analyzer';

import type { NextConfig } from 'next';

// Enable bundle analyzer only when ANALYZE env var is true
const bundleAnalyzer = withBundleAnalyzer({
	enabled: process.env.ANALYZE === 'true',
});

const nextConfig: NextConfig = {
	webpack(config) {
		config.module.rules.push({
			test: /\.svg$/,
			issuer: /\.[jt]sx?$/,
			use: [
				{
					loader: '@svgr/webpack',
					options: {
						icon: true,
					},
				},
			],
		});

		return config;
	},
};

export default bundleAnalyzer(nextConfig);
