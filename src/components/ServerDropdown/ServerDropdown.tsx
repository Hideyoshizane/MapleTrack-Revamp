'use client';

import Skeleton from '@mui/material/Skeleton';
import { clsx } from 'clsx';
import Image from 'next/image';
import { useRef, useEffect, useState, useMemo } from 'react';

import ChevronIcon from '@assets/svg/chevron-down.svg';
import serversJson from '@data/servers/servers.json';

import styles from './ServerDropdown.module.css';
import ServerItem from './ServerItem';

import type { Server } from '@sharedTypes/server';

interface ServerDropdownProps {
	serverCookie?: string;
	setServerCookie?: (value: string) => void;
}

export default function ServerDropdown({ serverCookie, setServerCookie }: ServerDropdownProps) {
	const [isOpen, setIsOpen] = useState(false);
	const dropdownRef = useRef<HTMLDivElement>(null);

	// Cast JSON to typed array of servers
	const servers: Server[] = serversJson as Server[];

	// Memoize the currently selected server for performance
	const selectedServer = useMemo(() => servers.find((s) => s.name === serverCookie), [servers, serverCookie]);

	// Toggle dropdown open/close state
	const handleToggle = () => setIsOpen((prev) => !prev);

	const handleSelectServer = (server: Server) => {
		setServerCookie?.(server.name);
		setIsOpen(false);
	};

	// Close dropdown when clicking outside
	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
				setIsOpen(false);
			}
		};
		document.addEventListener('mousedown', handleClickOutside);
		return () => document.removeEventListener('mousedown', handleClickOutside);
	}, []);

	// Skeleton placeholder while selectedServer is not ready
	if (!selectedServer) {
		return <Skeleton width={256} height={56} animation="wave" sx={{ bgcolor: 'rgba(0,0,0,0.3)' }} />;
	}

	return (
		<div ref={dropdownRef} className={clsx(styles.serverDropdownWrapper, { [styles.open]: isOpen })}>
			{/* Selected server button */}
			<div
				className={styles.selectedServerWrapper}
				onClick={handleToggle}
				tabIndex={0}
				role="button"
				aria-expanded={isOpen}
				aria-label={`Selected server: ${selectedServer.name}`}>
				<div className={styles.iconWrapper}>
					<Image src={selectedServer.img} alt={selectedServer.name} width={48} height={48} priority />
				</div>
				<p className={styles.serverName}>{selectedServer.name}</p>
				<ChevronIcon className={clsx(styles.icon, { [styles.rotatedActive]: isOpen, [styles.rotated]: true })} />
			</div>

			{/* Dropdown list */}
			<div className={styles.serversList}>
				{servers.map((server) => (
					<ServerItem
						key={server.name}
						server={server}
						isSelected={server.name === selectedServer.name}
						onSelect={handleSelectServer}
					/>
				))}
			</div>
		</div>
	);
}
