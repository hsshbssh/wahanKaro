import mongoose from "mongoose";

const mongodbUri = process.env.MONGO_DB_URI;

if (!mongodbUri) {
  throw new Error("MongoDB URI not found");
}

const cached = global.mongoose || {
  conn: null,
  promise: null,
};

if (!global.mongoose) {
  global.mongoose = cached;
}

const connectDb = async () => {
  // Already connected
  if (cached.conn && mongoose.connection.readyState === 1) {
    return cached.conn;
  }

  // Connection is currently being established
  if (!cached.promise) {
    cached.promise = mongoose
      .connect(mongodbUri, {
        serverSelectionTimeoutMS: 5000,
      })
      .then((mongoose) => mongoose.connection);
  }

  try {
    cached.conn = await cached.promise;

    console.log("Database connected");

    return cached.conn;
  } catch (error) {
    cached.promise = null;
    cached.conn = null;

    console.error("MongoDB connection error:", error);

    throw error;
  }
};

export default connectDb;