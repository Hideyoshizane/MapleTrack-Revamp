'use client';

import Image from 'next/image';

import CheckIcon from '@assets/svg/check.svg';

import styles from './ServerItem.module.scss';

import type { Server } from '@data/servers/servers';
import type { JSX, KeyboardEvent } from 'react';

type Props = {
	server: Server;
	isSelected: boolean;
	onSelect: (server: Server) => void;
};

const ServerItem = ({ server, isSelected, onSelect }: Props): JSX.Element => {
	const handleKey = (event: KeyboardEvent<HTMLDivElement>): void => {
		if (event.key === 'Enter' || event.key === ' ') {
			event.preventDefault();
			onSelect(server);
		}
	};

	return (
		<div
			className={styles.wrapper}
			aria-selected={isSelected}
			onClick={(): void => onSelect(server)}
			onKeyDown={handleKey}
			role="option"
			tabIndex={0}>
			<div className={styles.iconWrapper}>
				<Image alt={`${server.name} server icon`} height={48} priority src={server.img} width={48} />
			</div>

			<p className={styles.serverName}>{server.name}</p>

			{isSelected && <CheckIcon className={styles.icon} />}
		</div>
	);
};

export default ServerItem;
