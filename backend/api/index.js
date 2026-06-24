import 'dotenv/config';

import app from '../src/app.js';
import { connectDb } from '../src/lib/db.js';

export default async function handler(req, res) {
  await connectDb();
  return app(req, res);
}
