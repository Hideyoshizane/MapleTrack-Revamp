import mongoose from 'mongoose';

// Validate the environment variable and fallback to local DB
const MONGODB_URI = process.env.DB_URLXXXXX || 'mongodb://localhost:27017/MapleTrack';

// Define a custom global type to preserve the connection across hot reloads
type MongooseGlobal = typeof globalThis & {
	mongoose: {
		conn: mongoose.Mongoose | null;
		promise: Promise<mongoose.Mongoose> | null;
	};
};

// Cast globalThis to custom type
const globalWithMongoose = globalThis as MongooseGlobal;

// Initialize connection cache if it doesn't exist
if (!globalWithMongoose.mongoose) {
	globalWithMongoose.mongoose = {
		conn: null,
		promise: null,
	};
}

// Connects to the MongoDB database using Mongoose.
async function connectToDatabase(): Promise<mongoose.Mongoose> {
	// Return cached connection if it exists
	if (globalWithMongoose.mongoose.conn) {
		return globalWithMongoose.mongoose.conn;
	}

	// If a connection promise doesn't exist, create one
	if (!globalWithMongoose.mongoose.promise) {
		globalWithMongoose.mongoose.promise = mongoose.connect(MONGODB_URI, {
			bufferCommands: false, // Disable mongoose buffering to avoid unexpected behavior
			serverSelectionTimeoutMS: 10000, // Fail if cannot connect in 10s
			socketTimeoutMS: 20000, // Cancel requests if no response in 20s
		});
	}

	try {
		// Await the connection and cache it
		globalWithMongoose.mongoose.conn = await globalWithMongoose.mongoose.promise;
		return globalWithMongoose.mongoose.conn;
	} catch (err) {
		// If connection fails, reset the promise so it can retry next time
		globalWithMongoose.mongoose.promise = null;
		console.error('Failed to connect to MongoDB:', err);
		throw err;
	}
}

export default connectToDatabase;
