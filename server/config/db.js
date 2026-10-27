import mongoose from 'mongoose';

// Disable Mongoose query buffering GLOBALLY before any models are loaded.
// Without this, Mongoose silently buffers queries for up to 10 seconds while
// waiting for a connection, which causes the "buffering timed out" error when
// the server restarts (nodemon) or when Atlas takes a moment to respond.
// With this set, queries fail immediately with a clear error instead.
mongoose.set('bufferCommands', false);

// Cache the connection promise so subsequent requests reuse the existing connection
// (critical for serverless environments and for avoiding reconnects on nodemon restarts).
let connectionPromise = null;

export const connectDB = async () => {
  // If already connected, return immediately
  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  // If a connection is already in progress, wait for it instead of opening a second one
  if (connectionPromise) {
    return connectionPromise;
  }

  const uri = process.env.MONGO_URI;
  if (!uri) {
    throw new Error('MONGO_URI is not defined in environment variables');
  }

  const doConnect = async (connectionUri) => {
    return mongoose.connect(connectionUri, {
      serverSelectionTimeoutMS: 15000,
    });
  };

  connectionPromise = (async () => {
    try {
      const conn = await doConnect(uri);
      console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
      return conn;
    } catch (error) {
      console.warn(`Initial MongoDB connection failed: ${error.message}`);

      // If SRV lookup fails (EBADRESP/querySrv — known Node.js c-ares issue on some
      // environments), fall back to the direct replica-set connection string.
      if (
        uri.includes('cluster0.zxh4ubj.mongodb.net') &&
        (error.message.includes('EBADRESP') || error.message.includes('querySrv'))
      ) {
        console.log('🔄 Retrying with direct Atlas replicaSet configuration...');
        const fallbackUri =
          'mongodb://aarsheya25bcs10207_db_user:Lucky%40123@ac-qut2vpb-shard-00-00.zxh4ubj.mongodb.net:27017,ac-qut2vpb-shard-00-01.zxh4ubj.mongodb.net:27017,ac-qut2vpb-shard-00-02.zxh4ubj.mongodb.net:27017/pawpair?ssl=true&replicaSet=atlas-g2f3rr-shard-0&authSource=admin&retryWrites=true&w=majority';
        try {
          const conn = await doConnect(fallbackUri);
          console.log(`✅ MongoDB Connected (direct replicaSet): ${conn.connection.host}`);
          return conn;
        } catch (fallbackError) {
          connectionPromise = null; // allow retry on next invocation
          console.error(`❌ Fallback MongoDB Connection Failed: ${fallbackError.message}`);
          throw fallbackError;
        }
      }

      connectionPromise = null; // allow retry on next invocation
      throw error;
    }
  })();

  return connectionPromise;
};
