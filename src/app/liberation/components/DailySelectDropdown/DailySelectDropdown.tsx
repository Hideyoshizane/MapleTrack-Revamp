'use client';

import * as Select from '@radix-ui/react-select';
import Image from 'next/image';

import CheckIcon from '@assets/svg/check.svg';
import NoIcon from '@assets/svg/circle-x.svg';
import MenuIcon from '@assets/svg/menu.svg';
import { getSacredAreas } from '@data/liberation/astraDaily';
import { weaponQuestsImagesSrc } from '@data/liberation/liberationQuests';

import styles from './DailySelectDropdown.module.scss';

import type { JSX } from 'react';

type Props = {
	selectedDailyPreview: number;
	onSelectArea: (dailyValue: number) => void;
};

const IMAGE_SIZE = 40;
const ERION_SIZE = 24;

const DailySelectDropdown = ({ selectedDailyPreview, onSelectArea }: Props): JSX.Element => {
	const areas = getSacredAreas();

	const selectedArea = areas.find((area) => area.erion === selectedDailyPreview) ?? null;

	return (
		<div className={styles.progressPrevision}>
			<div className={styles.textDiv}>
				<p className={styles.title}>Daily Selection</p>
				<p className={styles.subTitle}>Insert the highest Symbol cleared for preview.</p>
			</div>

			<Select.Root
				onValueChange={(value): void => {
					onSelectArea(Number(value));
				}}
				value={selectedDailyPreview.toString()}
			>
				<Select.Trigger className={styles.selectedAreaWrapper}>
					<div className={styles.areaItem}>
						{selectedArea ? (
							<div className={styles.itemContent}>
								<Image
									alt={selectedArea.name}
									height={IMAGE_SIZE}
									priority
									src={selectedArea.img}
									width={IMAGE_SIZE}
								/>

								<p className={styles.itemName}>{selectedArea.name}</p>

								<div className={styles.erionText}>
									<Image
										alt="Erion"
										height={ERION_SIZE}
										src={weaponQuestsImagesSrc.astra_erion}
										width={ERION_SIZE}
									/>
									<p>{selectedArea.erion}</p>
								</div>
							</div>
						) : (
							<div className={styles.itemContent}>
								<NoIcon className={styles.noArea} height={IMAGE_SIZE} width={IMAGE_SIZE} />
								<p className={styles.itemName}>Skip</p>
								<div className={styles.erionText}>
									<Image
										alt="Erion"
										height={ERION_SIZE}
										src={weaponQuestsImagesSrc.astra_erion}
										width={ERION_SIZE}
									/>
									<p>{0}</p>
								</div>
							</div>
						)}
					</div>

					<div className={styles.iconsDiv}>
						<MenuIcon className={styles.menuIcon} />
					</div>
				</Select.Trigger>

				<Select.Content className={styles.areaList} position="popper">
					<div className={styles.scrollContainer}>
						<Select.Viewport>
							<Select.Item className={styles.areaItem} value="0">
								<div className={styles.itemContent}>
									<NoIcon className={styles.noArea} height={IMAGE_SIZE} width={IMAGE_SIZE} />

									<p className={styles.itemName}>Skip</p>

									<div className={styles.erionText}>
										<Image
											alt="Erion"
											height={ERION_SIZE}
											src={weaponQuestsImagesSrc.astra_erion}
											width={ERION_SIZE}
										/>

										<p>0</p>
									</div>

									{selectedDailyPreview === 0 && (
										<div className={styles.iconsDiv}>
											<CheckIcon className={styles.icon} />
										</div>
									)}
								</div>
							</Select.Item>

							{areas.map((area) => (
								<Select.Item className={styles.areaItem} key={area.name} value={area.erion.toString()}>
									<div className={styles.itemContent}>
										<Image alt={area.name} height={IMAGE_SIZE} src={area.img} width={IMAGE_SIZE} />

										<p className={styles.itemName}>{area.name}</p>

										<div className={styles.erionText}>
											<Image
												alt="Erion"
												height={ERION_SIZE}
												src={weaponQuestsImagesSrc.astra_erion}
												width={ERION_SIZE}
											/>

											<p>{area.erion}</p>
										</div>

										{selectedDailyPreview === area.erion && (
											<div className={styles.iconsDiv}>
												<CheckIcon className={styles.icon} />
											</div>
										)}
									</div>
								</Select.Item>
							))}
						</Select.Viewport>
					</div>
				</Select.Content>
			</Select.Root>
		</div>
	);
};

export default DailySelectDropdown;
