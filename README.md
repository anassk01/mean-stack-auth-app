# MEAN Stack Application

A full-stack application built with MongoDB, Express.js, Angular, and Node.js (MEAN stack).

## Features

- User Authentication & Authorization
- JWT-based Security
- RESTful API
- Angular Material UI Components
- State Management with NgRx
- TypeScript Support
- Email Service Integration
- Secure Password Handling
- Rate Limiting & Security Headers

## Prerequisites

- Node.js (v18 or higher)
- MongoDB (v6 or higher)
- Angular CLI (v19 or higher)
- Git

## Project Structure

```
mean-stack-app/
├── frontend/         # Angular application
├── backend/          # Node.js/Express API
└── README.md
```

## Getting Started

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create environment file:
   ```bash
   cp .env.example .env
   ```

4. Update the `.env` file with your configurations

5. Start the development server:
   ```bash
   npm run dev
   ```

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm start
   ```

The application will be available at `http://localhost:4200`

## Development

- Backend API runs on: `http://localhost:5000`
- Frontend development server: `http://localhost:4200`
- MongoDB default connection: `mongodb://localhost:27017/your-database-name`

## Scripts

### Backend

- `npm start`: Start production server
- `npm run dev`: Start development server
- `npm run build`: Build TypeScript code
- `npm run lint`: Run linting

### Frontend

- `npm start`: Start development server
- `npm run build`: Build production bundle
- `npm test`: Run tests
- `npm run watch`: Build in watch mode

## Deployment

1. Build the frontend:
   ```bash
   cd frontend && npm run build
   ```

2. Build the backend:
   ```bash
   cd backend && npm run build
   ```

3. Set up production environment variables
4. Start the server:
   ```bash
   cd backend && npm start
   ```

## Security

- JWT authentication
- HTTP-only cookies
- Rate limiting
- Helmet security headers
- Password hashing with Argon2
- CORS protection

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the MIT License. 