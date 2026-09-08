import dotenv from 'dotenv';
dotenv.config();

import app from './src/app.js';
import connectDB from './src/config/db.js';
import { verifyEmailConfig } from './src/services/emailService.js';

// Connect to MongoDB
connectDB();

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  const emailStatus = verifyEmailConfig();
  console.log(`\n======================================================`);
  console.log(`🚀 JOBLYST Backend listening on port ${PORT}`);
  console.log(`🔗 API Base: http://localhost:${PORT}/api`);
  console.log(`🏥 Health Check: http://localhost:${PORT}/api/health`);
  console.log(`📧 Email Provider: ${emailStatus.description}`);
  console.log(`======================================================\n`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error(`[Unhandled Rejection]: ${err.message}`);
  // Close server & exit process
  server.close(() => process.exit(1));
});
