// src/server.ts
import app from './app';
import { connectDB } from './config/database.config';
import { environment } from './config/environment.config';

// Connect to MongoDB
connectDB().then(() => {
  // Start Express server
  app.listen(environment.port, () => {
    console.log(`Server running in ${environment.nodeEnv} mode on port ${environment.port}`);
  });
}).catch(err => {
  console.error('Failed to connect to MongoDB:', err);
  process.exit(1);
});

process.on('unhandledRejection', (err) => {
  console.error('UNHANDLED REJECTION! 💥 Shutting down...');
  console.error(err);
  process.exit(1);
});