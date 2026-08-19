import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import apiRoutes from './routes/api.js';
import { verifyConnectivity } from './config/database.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

let dbReady = false;

async function ensureDbConnection() {
  if (!dbReady) {
    await verifyConnectivity();
    dbReady = true;
  }
}

app.use('/api', async (req, res, next) => {
  try {
    await ensureDbConnection();
    next();
  } catch (error) {
    dbReady = false;
    console.error('[DB] Connection failed:', error.message);
    return res.status(503).json({
      error: 'Service Unavailable',
      message: 'Graph database is currently unavailable.',
    });
  }
});

app.use('/api', apiRoutes);
app.use(notFoundHandler);
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

export default app;
