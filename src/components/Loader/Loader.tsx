import styles from './Loader.module.scss';

import type { JSX } from 'react';

interface LoaderProps {
	width?: number | string;
	height?: number | string;
	color?: string;
	borderWidth?: number;
}

const Loader = ({ width = 48, height = 48, color = '#FFF', borderWidth = 5 }: LoaderProps): JSX.Element => {
	const style: React.CSSProperties = {
		width: typeof width === 'number' ? `${width}px` : width,
		height: typeof height === 'number' ? `${height}px` : height,

		// Dynamic border
		borderWidth: `${borderWidth}px`,
		borderColor: color,
		borderBottomColor: 'transparent',
	};

	return <span className={styles.loader} style={style} />;
};

export default Loader;
