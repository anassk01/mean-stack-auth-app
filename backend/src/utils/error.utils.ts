// src/utils/error.utils.ts
export class AppError extends Error {
    statusCode: number;
    isOperational: boolean;
  
    constructor(message: string, statusCode: number) {
      super(message);
      this.statusCode = statusCode;
      this.isOperational = true;
  
      Error.captureStackTrace(this, this.constructor);
    }
  }
  
  export const handleError = (err: AppError | Error, res: any) => {
    if (err instanceof AppError && err.isOperational) {
      // Operational, trusted error: send message to client
      return res.status(err.statusCode).json({
        status: 'error',
        message: err.message
      });
    } 
    
    // Programming or other unknown error: don't leak error details
    console.error('ERROR 💥', err);
    return res.status(500).json({
      status: 'error',
      message: 'Something went wrong'
    });
  };