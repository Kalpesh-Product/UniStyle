import 'dotenv/config';

import app from './app.js';
import { connectDb } from './lib/db.js';

const PORT = process.env.PORT || 4000;

connectDb()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('Failed to connect to MongoDB:', err);
    process.exit(1);
  });
