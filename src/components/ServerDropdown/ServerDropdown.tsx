'use client';

import { clsx } from 'clsx';
import Image from 'next/image';
import { useRef, useEffect, useState, useMemo, useCallback } from 'react';

import ChevronIcon from '@assets/svg/chevron-down.svg';
import { SkeletonWrapper } from '@components/SkeletonWrapper/SkeletonWrapper';
import { servers } from '@data/servers/servers';

import styles from './ServerDropdown.module.scss';
import ServerItem from './ServerItem/ServerItem';

import type { Server } from '@sharedTypes/server';
import type { JSX } from 'react';

interface ServerDropdownProps {
	serverCookie?: string;
	setServerCookie?: (value: string) => void;
}

const ServerDropdown = ({ serverCookie, setServerCookie }: ServerDropdownProps): JSX.Element => {
	const [isOpen, setIsOpen] = useState(false);
	const dropdownRef = useRef<HTMLDivElement>(null);

	// Find selected server
	const selectedServer = useMemo(
		(): Server | undefined => servers.find((s): boolean => s.name === serverCookie),
		[serverCookie]
	);

	// Toggle dropdown open/close state
	const handleToggle = useCallback((): void => setIsOpen((p): boolean => !p), []);

	const handleSelectServer = useCallback(
		(server: Server): void => {
			setServerCookie?.(server.name);
			setIsOpen(false);
		},
		[setServerCookie]
	);

	// Close dropdown when clicking outside
	useEffect((): (() => void) => {
		const handleClickOutside = (event: MouseEvent): void => {
			if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) setIsOpen(false);
		};
		document.addEventListener('mousedown', handleClickOutside);
		return (): void => document.removeEventListener('mousedown', handleClickOutside);
	}, []);

	// Skeleton placeholder while selectedServer is not ready
	if (!selectedServer) return <SkeletonWrapper width={502} height={368} color="light" />;

	return (
		<div ref={dropdownRef} className={clsx(styles.serverDropdownWrapper, { [styles.open]: isOpen })}>
			{/* Selected server button */}
			<div
				className={styles.selectedServerWrapper}
				onClick={handleToggle}
				tabIndex={0}
				role="button"
				aria-expanded={isOpen}
				aria-label={`Selected server: ${selectedServer.name}`}
				onKeyDown={(e): void => {
					if (e.key === 'Enter' || e.key === ' ') {
						e.preventDefault();
						handleToggle();
					}
				}}>
				<div className={styles.iconWrapper}>
					<Image src={selectedServer.img} alt={selectedServer.name} width={48} height={48} priority />
				</div>
				<p className={styles.serverName}>{selectedServer.name}</p>
				<ChevronIcon
					className={clsx(styles.icon, styles.rotated, {
						[styles.rotatedActive]: isOpen,
					})}
				/>
			</div>
			<hr className={styles.hr} />
			{/* Dropdown list */}
			<div className={styles.serversList}>
				{servers.map(
					(server: Server): JSX.Element => (
						<ServerItem
							key={server.name}
							server={server}
							isSelected={server.name === selectedServer.name}
							onSelect={handleSelectServer}
						/>
					)
				)}
			</div>
		</div>
	);
};

export default ServerDropdown;
