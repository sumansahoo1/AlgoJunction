import express from 'express';
import cors from 'cors';
import router from './routes/routes.js';
import { connectDB } from './db/connectDb.js';

const app = express();

const allowedOrigins = [
  'https://algojunction.sumansahoo.com',
  'http://localhost:5173', // Vite dev server
];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (curl, server-to-server, Postman)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    callback(new Error(`Origin ${origin} not allowed by CORS`));
  },
}));

const port = process.env.PORT || 3000;

app.use(express.json());


connectDB();

// Use the consolidated routes
app.use('/', router);

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
