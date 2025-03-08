// src/config/database.config.ts
import mongoose from 'mongoose';
import { environment } from './environment.config';
import winston from 'winston';
import { createUserCollection } from '../models/user.model';

// Create logger
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  defaultMeta: { service: 'database-service' },
  transports: [
    new winston.transports.Console({
      format: winston.format.simple(),
    }),
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' }),
  ],
});

// Connect to MongoDB
export const connectDB = async (): Promise<void> => {
  try {
    mongoose.set('strictQuery', true);
    const conn = await mongoose.connect(environment.mongoUri);
    logger.info(`MongoDB Connected: ${conn.connection.host}`);
    
    // Set up collection validation
    await createUserCollection();
    logger.info('MongoDB collection validation setup completed');
  } catch (error) {
    if (error instanceof Error) {
      logger.error(`Error: ${error.message}`);
    } else {
      logger.error('Unknown error occurred');
    }
    process.exit(1);
  }
};