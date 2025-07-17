import mongoose from 'mongoose';

const MONGODB_URI = process.env.DB_URLXXXXX || 'mongodb://localhost:27017/MapleTrack';

type MongooseGlobal = typeof global & {
	mongoose: {
		conn: mongoose.Mongoose | null;
		promise: Promise<mongoose.Mongoose> | null;
	};
};
const globalWithMongoose = global as MongooseGlobal;

if (!globalWithMongoose.mongoose) {
	globalWithMongoose.mongoose = { conn: null, promise: null };
}

async function connectToDatabase(): Promise<mongoose.Mongoose> {
	if (globalWithMongoose.mongoose.conn) {
		return globalWithMongoose.mongoose.conn;
	}

	if (!globalWithMongoose.mongoose.promise) {
		globalWithMongoose.mongoose.promise = mongoose
			.connect(MONGODB_URI, {
				bufferCommands: false,
				serverSelectionTimeoutMS: 10000,
				socketTimeoutMS: 20000,
			})
			.then((mongooseInstance) => mongooseInstance)
			.catch((err) => {
				throw err;
			});
	}

	globalWithMongoose.mongoose.conn = await globalWithMongoose.mongoose.promise;
	return globalWithMongoose.mongoose.conn;
}

export default connectToDatabase;
