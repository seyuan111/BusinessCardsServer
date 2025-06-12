import express from 'express';
import { PORT } from './config.js';
import mongoose from 'mongoose';
import businessCardsRoute from './routes/booksRoute.js';
import userRoutes from './routes/userRoutes.js'
import cookieParser from 'cookie-parser'
import cors from 'cors';
import dotenv from 'dotenv';
dotenv.config();

const app = express();

// Middleware for parsing request body
app.use(express.json());
app.use(cookieParser());

// Middleware for handling CORS POLICY
// Option 1: Allow All Origins with Default of cors(*)
app.use(
  cors({
    origin: 'http://localhost:5173', // Specify the frontend origin
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], // Include OPTIONS for preflight
    allowedHeaders: ['Content-Type', 'Authorization'], // Allow necessary headers
    credentials: true, // Allow cookies and credentials
  })
);

app.get('/', (request, response) => {
  console.log(request);
  return response.status(234).send('welcome to Business cards');
});

app.use('/cards', businessCardsRoute);
app.use('/users', userRoutes);

mongoose
  .connect(process.env.mongoDBURL)
  .then(() => {
    console.log('Connected to MongoDB')
    app.listen(PORT, () => {
      console.log(`App is listening on port: ${PORT}`);
    });
  })
  .catch((error) => {
    console.error('MongoDB connection error:', error);
  });
