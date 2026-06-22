import 'dotenv/config';

import express from 'express';
import cors from 'cors';
import router from './routes/routes.js';
import { connectDB, setupConnectionListeners } from './db/connectDb.js';
import { globalLimiter } from './middleware/rateLimiter.js';

const app = express();

app.set('trust proxy', 1);

const allowedOrigins = [
  'https://algojunction.sumansahoo.com',
  'http://localhost:5173',
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    callback(new Error(`Origin ${origin} not allowed by CORS`));
  },
}));

const port = process.env.PORT || 3000;

app.use(express.json());

app.use(globalLimiter);

app.use('/', router);

async function start() {
    setupConnectionListeners();
    await connectDB();
    app.listen(port, () => {
        console.log(`Server is running on port ${port}`);
    });
}

start();
