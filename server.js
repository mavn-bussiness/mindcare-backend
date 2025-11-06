import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import connectDB from './config/database.js';
import waitlistRoutes from './routes/waitlist.js';
import adminRoutes from './routes/admin.js';
import { errorHandler } from './middleware/errorHandler.js';
import { testEmailConnection } from './services/emailService.js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.set('trust proxy', 1);

// Connect to Database
connectDB();

// Test email connection on startup
(async () => {
  console.log('\n📧 Testing email configuration...');
  const emailTest = await testEmailConnection();
  if (emailTest.success) {
    console.log('✅ Email service is ready\n');
  } else {
    console.error('❌ Email service is NOT configured properly:', emailTest.error);
    console.error('⚠️  Please check your environment variables:');
    console.error('   - EMAIL_HOST');
    console.error('   - EMAIL_PORT');
    console.error('   - EMAIL_USER');
    console.error('   - EMAIL_PASSWORD\n');
  }
})();

// Middleware
app.use(helmet()); // Security headers
app.use(cors({
  origin: [
    process.env.FRONTEND_URL || 'http://localhost:5173', 
    'https://mindcare-nu-five.vercel.app'
  ],
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Routes
app.get('/api/health', async (req, res) => {
  const emailStatus = await testEmailConnection();
  
  res.json({ 
    status: 'OK', 
    message: 'MindCare API is running',
    timestamp: new Date().toISOString(),
    services: {
      database: 'connected',
      email: emailStatus.success ? 'connected' : 'error',
      emailError: emailStatus.success ? null : emailStatus.error
    },
    environment: {
      nodeEnv: process.env.NODE_ENV || 'development',
      emailConfigured: !!(process.env.EMAIL_HOST && process.env.EMAIL_USER)
    }
  });
});

app.use('/api/waitlist', waitlistRoutes);
app.use('/api/admin', adminRoutes);

// Error handling middleware
app.use(errorHandler);

// Start server
const server = app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📧 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 API: http://localhost:${PORT}/api`);
  console.log(`🏥 Health Check: http://localhost:${PORT}/api/health`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
  });
});

export default app;
