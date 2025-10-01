import mongoose from 'mongoose';

// Validate the environment variable and fallback to local DB
const MONGODB_URL = process.env.DB_URL;
if (!MONGODB_URL) {
	throw new Error('MongoDB connection string is missing. Set DB_URL in your environment variables.');
}

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
globalWithMongoose.mongoose ??= { conn: null, promise: null };

// Connects to the MongoDB database using Mongoose.
const connectToDatabase = async (): Promise<mongoose.Mongoose> => {
	// Return cached connection if it exists
	if (globalWithMongoose.mongoose.conn) {
		return globalWithMongoose.mongoose.conn;
	}

	// If a connection promise doesn't exist, create one
	if (!globalWithMongoose.mongoose.promise) {
		globalWithMongoose.mongoose.promise = mongoose
			.connect(MONGODB_URL, {
				bufferCommands: false, // Disable mongoose buffering to avoid unexpected behavior
				serverSelectionTimeoutMS: 10000, // Fail if cannot connect in 10s
				socketTimeoutMS: 20000, // Cancel requests if no response in 20s
				directConnection: !MONGODB_URL.includes('mongodb+srv://'), // DirectConnection avoids issues with local replica set URIs
			})
			.then(async (mongooseInstance: mongoose.Mongoose): Promise<mongoose.Mongoose> => {
				// Only run replica set init if using local MongoDB
				if (MONGODB_URL.includes('localhost')) {
					try {
						const db = mongooseInstance.connection.db;
						if (db) {
							const admin = db.admin();
							const replStatus = await admin.command({ replSetGetStatus: 1 }).catch((): null => null);

							if (!replStatus) {
								console.warn('No replica set detected locally. Attempting to initiate one...');
								await admin.command({
									replSetInitiate: {
										_id: 'rs0',
										members: [{ _id: 0, host: 'localhost:27017' }],
									},
								});
								console.log('Replica set initiated. Restart MongoDB and reconnect if needed.');
							}
						} else {
							console.error('Database handle is undefined after connection.');
						}
					} catch (err) {
						console.error('Replica set check/init failed:', err);
					}
				}

				return mongooseInstance;
			})
			.catch((error: unknown): never => {
				globalWithMongoose.mongoose.promise = null; // reset on failure
				console.error('Failed to connect to MongoDB:', error);
				throw error;
			});
	}

	// Await the promise and cache the connection
	globalWithMongoose.mongoose.conn = await globalWithMongoose.mongoose.promise;
	return globalWithMongoose.mongoose.conn;
};

export default connectToDatabase;
