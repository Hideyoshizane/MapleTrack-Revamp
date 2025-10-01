import withBundleAnalyzer from '@next/bundle-analyzer';

import type { NextConfig } from 'next';
import type { Configuration, RuleSetRule } from 'webpack';

const bundleAnalyzer = withBundleAnalyzer({
	enabled: process.env.ANALYZE === 'true',
}) as (config: NextConfig) => NextConfig;

const nextConfig: NextConfig = {
	images: {
		remotePatterns: [
			{
				protocol: 'https',
				hostname: 'www.nexon.com',
				pathname: '/api/maplestory/**',
			},
			{
				protocol: 'https',
				hostname: 'msavatar1.nexon.net',
				pathname: '/Character/**',
			},
		],
		qualities: [75, 100],
	},
	webpack(config: Configuration): Configuration {
		if (config.module) {
			(config.module.rules as RuleSetRule[]).push({
				test: /\.svg$/,
				issuer: /\.[jt]sx?$/,
				use: [
					{
						loader: '@svgr/webpack',
						options: { icon: true },
					},
				],
			});
		}

		return config;
	},
};

export default bundleAnalyzer(nextConfig);
