// src/components/ServerDropdown/ServerItem.tsx
'use client';

import Image from 'next/image';
import { KeyboardEvent } from 'react';

import CheckIcon from '@assets/svg/check.svg';

import styles from './ServerItem.module.css';

import type { Server } from '@sharedTypes/server';

interface ServerItemProps {
	server: Server;
	isSelected: boolean;
	onSelect: (server: Server) => void;
}

export default function ServerItem({ server, isSelected, onSelect }: ServerItemProps) {
	const handleKey = (event: KeyboardEvent<HTMLDivElement>) => {
		if (event.key === 'Enter' || event.key === ' ') {
			event.preventDefault();
			onSelect(server);
		}
	};

	return (
		<div className={styles.wrapper} onClick={() => onSelect(server)} tabIndex={0} role="button" onKeyDown={handleKey}>
			<div className={styles.iconWrapper}>
				<Image src={server.img} priority width={48} height={48} alt={`${server.name} server icon`} />
			</div>
			<p className={styles.serverName}>{server.name}</p>
			{isSelected && <CheckIcon className={styles.icon} />}
		</div>
	);
}
