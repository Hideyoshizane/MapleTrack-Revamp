import NextImage from 'next/image';

import ErrorIcon from '@assets/svg/circle-x.svg';

import styles from './Image.module.scss';

import type { ImageProps } from 'next/image';

const ERROR_IMG_SIZE = 80;

export default function Image({ src, ...props }: ImageProps) {
	if (!src) {
		return <ErrorIcon className={styles.errorIcon} height={ERROR_IMG_SIZE} width={ERROR_IMG_SIZE} />;
	}

	return <NextImage quality={100} src={src} {...props} />;
}
