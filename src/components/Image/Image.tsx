import NextImage from 'next/image';

import type { ImageProps } from 'next/image';

export default function Image(props: ImageProps) {
	return <NextImage quality={100} {...props} />;
}
