import mongoose from 'mongoose';

// Validate the environment variable and fallback to local DB
const MONGODB_URL =
	process.env.DB_URL || (process.env.NODE_ENV === 'development' ? 'mongodb://localhost:27017/MapleTrack' : undefined);

// Define a custom global type to preserve the connection across hot reloads
type MongooseGlobal = typeof globalThis & {
	mongoose: {
		conn: mongoose.Mongoose | null;
		promise: Promise<mongoose.Mongoose> | null;
	};
};

// Ensure MONGODB_URL is defined
if (!MONGODB_URL) {
	throw new Error('MongoDB connection string is missing. Set DB_URL in your environment variables.');
}

// Cast globalThis to custom type
const globalWithMongoose = globalThis as MongooseGlobal;

// Initialize connection cache if it doesn't exist
globalWithMongoose.mongoose ??= { conn: null, promise: null };

// Connects to the MongoDB database using Mongoose.
const connectToDatabase = async (): Promise<mongoose.Mongoose> => {
	// Return cached connection if it exists
	if (globalWithMongoose.mongoose!.conn) {
		return globalWithMongoose.mongoose!.conn;
	}

	// If a connection promise doesn't exist, create one
	if (!globalWithMongoose.mongoose!.promise) {
		globalWithMongoose.mongoose!.promise = mongoose
			.connect(MONGODB_URL, {
				bufferCommands: false, // Disable mongoose buffering to avoid unexpected behavior
				serverSelectionTimeoutMS: 10000, // Fail if cannot connect in 10s
				socketTimeoutMS: 20000, // Cancel requests if no response in 20s
			})
			.then((mongooseInstance) => {
				console.log('MongoDB connected');
				return mongooseInstance;
			})
			.catch((error) => {
				globalWithMongoose.mongoose!.promise = null; // reset on failure
				console.error('Failed to connect to MongoDB:', error);
				throw error;
			});
	}

	// Await the promise and cache the connection
	globalWithMongoose.mongoose!.conn = await globalWithMongoose.mongoose!.promise;
	return globalWithMongoose.mongoose!.conn;
};

export default connectToDatabase;
