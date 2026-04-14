'use client';

import * as ScrollArea from '@radix-ui/react-scroll-area';
import * as Select from '@radix-ui/react-select';
import Image from 'next/image';

import MenuIcon from '@assets/svg/menu.svg';
import { SkeletonWrapper } from '@components/SkeletonWrapper/skeletonWrapper';
import { servers } from '@data/servers/servers';

import styles from './serverDropdown.module.scss';
import ServerItem from './ServerItem/serverItem';

import type { Server, ServerName } from '@data/servers/servers';
import type { JSX } from 'react';

type ServerDropdownProps = {
	server: ServerName;
	setServerCookie?: (value: ServerName) => void;
};

const ServerDropdown = ({ server, setServerCookie }: ServerDropdownProps): JSX.Element => {
	const selectedServer: Server | undefined = servers.find((s: Server): boolean => s.name === server);

	if (!selectedServer) {
		return <SkeletonWrapper width={502} height={368} color="light" variant="rounded" />;
	}

	return (
		<Select.Root
			value={selectedServer.name}
			onValueChange={(value: string): void => {
				setServerCookie?.(value as ServerName);
			}}>
			<Select.Trigger className={styles.selectedServerWrapper} aria-label={`Selected server: ${selectedServer.name}`}>
				<div className={styles.iconWrapper}>
					<Image src={selectedServer.img} alt={selectedServer.name} width={48} height={48} priority />
				</div>

				<p className={styles.serverName}>{selectedServer.name}</p>

				<MenuIcon className={styles.icon} />
			</Select.Trigger>

			<Select.Portal>
				<Select.Content className={styles.serversList} position="popper">
					<ScrollArea.Root className={styles.scrollAreaRoot} type="auto">
						<ScrollArea.Viewport className={styles.scrollAreaViewport}>
							<Select.Viewport>
								{servers.map(
									(serverItem: Server): JSX.Element => (
										<Select.Item key={serverItem.name} value={serverItem.name} className={styles.serverItem}>
											<ServerItem
												server={serverItem}
												isSelected={serverItem.name === selectedServer.name}
												onSelect={() => {
													setServerCookie?.(serverItem.name);
												}}
											/>
										</Select.Item>
									),
								)}
							</Select.Viewport>
						</ScrollArea.Viewport>

						<ScrollArea.Scrollbar className={styles.scrollAreaScrollbar} orientation="vertical">
							<ScrollArea.Thumb className={styles.scrollAreaThumb} />
						</ScrollArea.Scrollbar>
					</ScrollArea.Root>
				</Select.Content>
			</Select.Portal>
		</Select.Root>
	);
};

export default ServerDropdown;
