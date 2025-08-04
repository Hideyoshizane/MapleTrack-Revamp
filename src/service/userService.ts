import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';

import { LASTVERSION } from '@models/user';

import type { IUser } from '@models/user';

dayjs.extend(utc);

// Update the lastLogin timestamp to current UTC time
export function updateLastLogin(user: IUser): void {
	user.lastLogin = dayjs().utc().toDate();
}

// Set the version to the latest defined constant
export function updateUserVersion(user: IUser): void {
	user.version = LASTVERSION;
}
