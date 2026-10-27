import mongoose from 'mongoose';

export const connectDB = async () => {
  let uri = process.env.MONGO_URI;
  if (!uri) {
    throw new Error('MONGO_URI is not defined in environment variables');
  }

  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 8000,
    });
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.warn(`Initial MongoDB connection failed with error: ${error.message}`);
    // If SRV lookup fails with EBADRESP or querySrv error, attempt known direct replica-set string for cluster0.zxh4ubj.mongodb.net
    if (uri.includes('cluster0.zxh4ubj.mongodb.net') && (error.message.includes('EBADRESP') || error.message.includes('querySrv'))) {
      console.log('🔄 Retrying connection using direct Atlas replicaSet configuration...');
      const fallbackUri = "mongodb://aarsheya25bcs10207_db_user:Lucky%40123@ac-qut2vpb-shard-00-00.zxh4ubj.mongodb.net:27017,ac-qut2vpb-shard-00-01.zxh4ubj.mongodb.net:27017,ac-qut2vpb-shard-00-02.zxh4ubj.mongodb.net:27017/pawpair?ssl=true&replicaSet=atlas-g2f3rr-shard-0&authSource=admin&retryWrites=true&w=majority";
      try {
        const conn = await mongoose.connect(fallbackUri, {
          serverSelectionTimeoutMS: 8000,
        });
        console.log(`✅ MongoDB Connected (via direct replicaSet): ${conn.connection.host}`);
        return conn;
      } catch (fallbackError) {
        console.error(`❌ Fallback MongoDB Connection Failed: ${fallbackError.message}`);
        throw fallbackError;
      }
    }
    throw error;
  }
};
