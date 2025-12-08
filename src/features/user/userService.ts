import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';

import { LASTVERSION } from '@data/user/constants';

import type { IUser } from '@features/user/userModel';

dayjs.extend(utc);

// Update the lastLogin timestamp to current UTC time
export const updateLastLogin = (user: IUser): void => {
	user.lastLogin = dayjs().utc().toDate();
};

// Set the version to the latest defined constant
export const updateUserVersion = (user: IUser): void => {
	user.version = LASTVERSION;
};
