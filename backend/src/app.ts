// src/app.ts
import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { environment } from './config/environment.config';
import authRoutes from './routes/auth.routes';
import { apiLimiter } from './middleware/rate-limiter';
import { validateCsrf } from './middleware/csrf.middleware';
import { AppError } from './utils/error.utils';


const app: Express = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser(environment.cookieSecret));

// Security middleware - Enhanced Helmet Configuration
app.use(
  helmet({
    // Content Security Policy
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", "data:"],
        connectSrc: ["'self'"],
        fontSrc: ["'self'"],
        objectSrc: ["'none'"],
        mediaSrc: ["'self'"],
        frameSrc: ["'none'"],
      },
    },
    // Strict Transport Security (HSTS)
    // Ensures the browser only uses HTTPS for future requests
    hsts: {
      maxAge: 15552000, // 180 days in seconds
      includeSubDomains: true,
      preload: true,
    },
    // X-Content-Type-Options
    // Prevents browsers from MIME-sniffing a response away from the declared content-type
    xContentTypeOptions: true,
    // X-Frame-Options
    // Prevents clickjacking by disallowing the page to be embedded in a frame
    xFrameOptions: { action: 'deny' },
    // X-XSS-Protection
    // Enables the browser's built-in XSS filtering
    xXssProtection: true,
    // Referrer Policy
    // Controls what information is sent in the Referer header
    referrerPolicy: { policy: 'same-origin' },
    // Cross-Origin Resource Policy
    // Blocks cross-origin requests to your resources
    crossOriginResourcePolicy: { policy: 'same-origin' },
  })
);

// Development-specific middleware
if (environment.nodeEnv === 'development') {
  // For development, disable CSP to allow for easier debugging
  app.use((req, res, next) => {
    res.setHeader(
      'Content-Security-Policy',
      "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data:"
    );
    next();
  });
}

app.use(cors({
  origin: environment.clientUrl,
  credentials: true // Important for cookies to work cross-domain
}));

// Apply rate limiting to all requests
app.use(apiLimiter);

// Apply CSRF protection globally
app.use(validateCsrf);

// Routes
app.use('/api/auth', authRoutes);


// Health check route
app.get('/api/health', (_, res) => {
  res.status(200).json({ status: 'ok' });
});



// 404 handler
app.use((req, res, next) => {
  const error = new AppError(`Not found - ${req.originalUrl}`, 404);
  next(error);
});

// Global error handler
app.use((err: Error | AppError, req: Request, res: Response, next: NextFunction) => {
  console.error(err);

  const statusCode = (err as AppError).statusCode || 500;
  const message = err.message || 'Internal Server Error';

  res.status(statusCode).json({
    status: 'error',
    statusCode,
    message,
    stack: environment.nodeEnv === 'development' ? err.stack : undefined
  });
});

export default app;