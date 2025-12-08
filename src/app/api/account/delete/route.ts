import mongoose from 'mongoose';
import { getToken } from 'next-auth/jwt';

import { BossList } from '@features/Boss/bossListModel';
import { Character } from '@features/character/characterModel';
import User from '@features/user/userModel';
import connectToDatabase from '@lib/mongooseConect';
import { deleteAccountRequestSchema } from '@schemas/authSchemas';
import { createResponse } from '@utils/createResponse';
import { sanitizeInputBackEnd } from '@utils/sanitizeInputBackEnd';

import type { ApiResponse } from '@sharedTypes/api';
import type { NextRequest, NextResponse } from 'next/server';

export const DELETE = async (request: NextRequest): Promise<NextResponse> => {
	try {
		await connectToDatabase();

		// Validate request body using Zod
		const parseResult = deleteAccountRequestSchema.safeParse(await request.json());
		if (!parseResult.success) {
			return createResponse<ApiResponse>({ success: false, message: 'Invalid request body' }, 400);
		}

		// Sanitize input
		const [username] = [parseResult.data.username].map(sanitizeInputBackEnd);
		if (!username) return createResponse<ApiResponse>({ success: false, message: 'Invalid request body' }, 400);

		// Extract token from the request cookies
		const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
		if (!token) return createResponse<ApiResponse>({ success: false, message: 'Unauthorized' }, 401);

		// Ensure the authenticated user matches the username being deleted
		if (token.username !== username) return createResponse<ApiResponse>({ success: false, message: 'Forbidden' }, 403);

		// Find user by username
		const user = await User.findOne({ username });
		if (!user) return createResponse<ApiResponse>({ success: false, message: 'Invalid username' }, 404);

		// Start a session for transactional safety
		const session = await mongoose.startSession();
		session.startTransaction();

		try {
			// Delete characters owned by user
			await Character.deleteMany({ userOrigin: username }, { session });

			// Delete bossList
			await BossList.deleteOne({ userOrigin: username });

			// Delete the user
			await User.deleteOne({ _id: user._id }, { session });

			// Commit the transaction
			await session.commitTransaction();
			await session.endSession();

			return createResponse<ApiResponse>(
				{ success: true, message: 'Account and related data deleted successfully.' },
				200
			);
		} catch (error) {
			// Rollback if anything fails
			await session.abortTransaction();

			console.error('Delete account transaction failed:', error);
			return createResponse<ApiResponse>({ success: false, message: 'A error has occurred.' }, 500);
		} finally {
			await session.endSession();
		}
	} catch (error) {
		console.error('Delete account error:', error);
		return createResponse<ApiResponse>({ success: false, message: 'Internal Server Error' }, 500);
	}
};
