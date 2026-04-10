'use client';

import Image from 'next/image';

import CheckIcon from '@assets/svg/check.svg';

import styles from './serverItem.module.scss';

import type { Server } from '@data/servers/servers';
import type { JSX, KeyboardEvent } from 'react';

type ServerItemProps = {
	server: Server;
	isSelected: boolean;
	onSelect: (server: Server) => void;
};

export default function ServerItem({ server, isSelected, onSelect }: ServerItemProps): JSX.Element {
	const handleKey = (event: KeyboardEvent<HTMLDivElement>): void => {
		if (event.key === 'Enter' || event.key === ' ') {
			event.preventDefault();
			onSelect(server);
		}
	};

	return (
		<div
			className={styles.wrapper}
			onClick={(): void => onSelect(server)}
			tabIndex={0}
			role="option"
			aria-selected={isSelected}
			onKeyDown={handleKey}>
			<div className={styles.iconWrapper}>
				<Image src={server.img} priority width={48} height={48} alt={`${server.name} server icon`} />
			</div>
			<p className={styles.serverName}>{server.name}</p>
			{isSelected && <CheckIcon className={styles.icon} />}
		</div>
	);
}
