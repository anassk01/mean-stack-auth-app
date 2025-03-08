# MEAN Authentication System

A robust, secure authentication system built with the MEAN stack (MongoDB, Express.js, Angular, and Node.js). This project implements industry-standard security practices for user authentication and authorization.

![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)
![MongoDB](https://img.shields.io/badge/MongoDB-v7.0.16-green.svg)
![Express](https://img.shields.io/badge/Express-v4.21.2-blue.svg)
![Angular](https://img.shields.io/badge/Angular-v19.2.1-red.svg)
![Node](https://img.shields.io/badge/Node-v22.11.0-green.svg)

## 🔐 Key Features

- **Secure Authentication Flow**: Complete user registration, email verification, login, password reset
- **JWT-based Authorization**: Access and refresh token implementation
- **Advanced Security Measures**: 
  - HTTP-only cookies
  - CSRF protection
  - Argon2id password hashing
  - Token rotation
  - Rate limiting
  - MongoDB schema validation
- **Responsive UI**: Mobile-friendly design using modern Angular techniques
- **TypeScript**: End-to-end type safety for both frontend and backend

## 🛠️ Technology Stack

### Backend
- **MongoDB** (v7.0.16): NoSQL database with schema validation
- **Express.js** (v4.21.2): Backend web framework with TypeScript
- **Node.js** (v22.11.0): JavaScript runtime environment

### Frontend
- **Angular** (v19.2.1): Frontend framework using standalone components and signals
- **Angular Material** (v19.2.2): UI component library
- **NgRx** (v19.0.1): State management with Redux pattern
- **TypeScript**: Static typing for improved code quality and developer experience

### Security Libraries
- **argon2**: Modern password hashing algorithm (superior to bcrypt)
- **jsonwebtoken**: JWT implementation for access and refresh tokens
- **helmet**: Security headers for Express
- **zod**: Runtime schema validation
- **express-rate-limit**: API rate limiting to prevent abuse

## 📁 Project Structure

```
project/
├── backend/              # Express.js server
│   ├── src/
│   │   ├── config/       # Configuration files
│   │   ├── controllers/  # Route controllers
│   │   ├── middleware/   # Express middleware
│   │   ├── models/       # MongoDB schemas
│   │   ├── routes/       # API routes
│   │   ├── services/     # Business logic
│   │   ├── utils/        # Utility functions
│   │   ├── app.ts        # Express app setup
│   │   └── server.ts     # Server entry point
│   ├── package.json
│   └── tsconfig.json
│
└── frontend/             # Angular client
    ├── src/
    │   ├── app/
    │   │   ├── core/     # Auth guards, services, etc.
    │   │   ├── domains/  # Feature modules
    │   │   ├── layout/   # Layout components
    │   │   └── shared/   # Reusable components
    │   ├── environments/ # Environment config
    │   └── assets/       # Static assets
    ├── angular.json
    └── package.json
```

## 🚀 Getting Started

### Prerequisites
- Node.js v22 or higher
- MongoDB v7.0 or higher
- npm or yarn

### Backend Setup

1. Clone the repository
   ```bash
   git clone https://github.com/yourusername/mean-auth-system.git
   cd mean-auth-system
   ```

2. Install backend dependencies
   ```bash
   cd backend
   npm install
   ```

3. Create a `.env` file in the backend directory with the following variables:
   ```
   NODE_ENV=development
   PORT=5000
   MONGO_URI=mongodb://localhost:27017/auth-app
   JWT_SECRET=your-secret-key
   JWT_EXPIRES_IN=15m
   REFRESH_TOKEN_SECRET=your-refresh-secret-key
   REFRESH_TOKEN_EXPIRES_IN=7d
   COOKIE_SECRET=your-cookie-secret
   CLIENT_URL=http://localhost:4200
   
   # Email settings
   EMAIL_HOST=smtp.example.com
   EMAIL_PORT=587
   EMAIL_SECURE=false
   EMAIL_USER=user@example.com
   EMAIL_PASSWORD=password
   EMAIL_FROM_NAME=MEAN Auth App
   EMAIL_FROM_ADDRESS=noreply@example.com
   ```

4. Start the backend server
   ```bash
   npm run dev
   ```

### Frontend Setup

1. Install frontend dependencies
   ```bash
   cd ../frontend
   npm install
   ```

2. Update environment files if needed
   The `environment.ts` file contains configuration settings like the API URL.

3. Start the Angular development server
   ```bash
   ng serve
   ```

4. Navigate to `http://localhost:4200` in your browser

## 🔍 Security Implementation Details

### Token & Cookie Strategy
- **Access Token**: Short-lived (15 minutes), stored as HTTP-only cookie
- **Refresh Token**: Longer-lived (7 days), HTTP-only cookie with restricted path
- **CSRF Protection**: CSRF token implementation to prevent cross-site request forgery
- **Token Rotation**: Refresh tokens are rotated with each use to prevent replay attacks

### Password Security
- **Argon2id**: Modern password hashing algorithm with enhanced security parameters
- **Strong Password Policy**: Enforced on both frontend and backend
- **Account Lockout**: Progressive delays and lockout after multiple failed attempts

### API Protection
- **Rate Limiting**: Prevents brute force attacks on login and sensitive endpoints
- **Input Validation**: Comprehensive validation using Zod schemas
- **Schema Validation**: MongoDB schema validation ensures data integrity

## 📜 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/refresh` - Refresh access token
- `POST /api/auth/logout` - User logout
- `GET /api/auth/verify-email/:token` - Email verification
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Process password reset
- `GET /api/auth/me` - Get current user profile

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the [MIT License](LICENSE) - see the LICENSE file for details.

## ⚠️ Security Considerations

While this project implements numerous security best practices, security is an ongoing process:

- Keep all dependencies updated to protect against vulnerabilities
- Use environment variables for all sensitive information
- In production, ensure all cookies use the Secure flag
- Implement proper logging and monitoring for suspicious activities
- Consider additional security measures such as Two-Factor Authentication for enhanced security
