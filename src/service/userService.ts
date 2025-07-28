import User, { LASTVERSION } from '@models/user';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import bcrypt from 'bcrypt';

dayjs.extend(utc);

export async function updateLastLogin(userID: string): Promise<void> {
	const userData = await User.findById(userID);
	if (!userData) throw new Error('User not found');

	userData.lastLogin = dayjs().utc().toDate();
	await userData.save();
}

export async function updateUserVersion(userID: string): Promise<void> {
	const userData = await User.findById(userID);
	if (!userData) throw new Error('User not found');

	userData.version = LASTVERSION;
	await userData.save();
}

export async function resetPasswordEmptyUser(username: string): Promise<void> {
	const userData = await User.findOne({ username });
	if (!userData) throw new Error('User not found');

	const salt = await bcrypt.genSalt(10);
	const hashedPassword = await bcrypt.hash('123456', salt);
	userData.password = hashedPassword;
	await userData.save();
}
