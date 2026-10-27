import mongoose from 'mongoose';

// Cache the connection promise so subsequent requests in the same
// serverless function instance reuse the existing connection.
let connectionPromise = null;

export const connectDB = async () => {
  // If already connected, return immediately
  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  // If a connection is in progress, wait for it
  if (connectionPromise) {
    return connectionPromise;
  }

  let uri = process.env.MONGO_URI;
  if (!uri) {
    throw new Error('MONGO_URI is not defined in environment variables');
  }

  const connect = async (connectionUri) => {
    return mongoose.connect(connectionUri, {
      serverSelectionTimeoutMS: 8000,
    });
  };

  connectionPromise = (async () => {
    try {
      const conn = await connect(uri);
      console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
      return conn;
    } catch (error) {
      console.warn(`Initial MongoDB connection failed: ${error.message}`);

      // If SRV lookup fails (EBADRESP/querySrv — known Node.js c-ares issue on some environments),
      // fall back to the direct replica-set connection string.
      if (
        uri.includes('cluster0.zxh4ubj.mongodb.net') &&
        (error.message.includes('EBADRESP') || error.message.includes('querySrv'))
      ) {
        console.log('🔄 Retrying with direct Atlas replicaSet configuration...');
        const fallbackUri =
          'mongodb://aarsheya25bcs10207_db_user:Lucky%40123@ac-qut2vpb-shard-00-00.zxh4ubj.mongodb.net:27017,ac-qut2vpb-shard-00-01.zxh4ubj.mongodb.net:27017,ac-qut2vpb-shard-00-02.zxh4ubj.mongodb.net:27017/pawpair?ssl=true&replicaSet=atlas-g2f3rr-shard-0&authSource=admin&retryWrites=true&w=majority';
        try {
          const conn = await connect(fallbackUri);
          console.log(`✅ MongoDB Connected (direct replicaSet): ${conn.connection.host}`);
          return conn;
        } catch (fallbackError) {
          connectionPromise = null; // allow retry on next request
          console.error(`❌ Fallback MongoDB Connection Failed: ${fallbackError.message}`);
          throw fallbackError;
        }
      }

      connectionPromise = null; // allow retry on next request
      throw error;
    }
  })();

  return connectionPromise;
};
