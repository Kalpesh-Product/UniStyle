import dns from 'dns';
import mongoose from 'mongoose';

// Node's bundled DNS resolver (c-ares) sometimes fails to read this
// machine's real DNS servers on Windows and falls back to 127.0.0.1,
// which breaks the SRV lookup mongodb+srv:// URIs depend on.
dns.setServers(['8.8.8.8', '4.2.2.2']);

// On Vercel, this module can be re-invoked across many serverless requests,
// so the connection must be cached rather than reconnected every time.
let connectionPromise = null;

export function connectDb() {
  if (mongoose.connection.readyState === 1) return Promise.resolve(mongoose.connection);
  if (!connectionPromise) {
    connectionPromise = mongoose.connect(process.env.DATABASE_URL).then((conn) => {
      console.log('Connected to MongoDB');
      return conn;
    });
  }
  return connectionPromise;
}
