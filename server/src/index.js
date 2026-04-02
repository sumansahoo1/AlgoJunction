import express from 'express';
import cors from 'cors';
import router from './routes/routes.js';
import { connectDB } from './db/connectDb.js';

const app = express();
app.use(cors());
const port = 3000;

app.use(express.json());


connectDB();

// Use the consolidated routes
app.use('/', router);

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
