import { Request, Response, NextFunction } from 'express';
import { Schema } from 'joi';
import { ApiResponse } from '../types';

export const validateRequest = (schema: Schema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const { error, value } = schema.validate(req.body);
    
    if (error) {
      const response: ApiResponse = {
        success: false,
        error: 'Validation error',
        details: {
          message: error.details[0].message,
          path: error.details[0].path
        }
      };
      return res.status(400).json(response);
    }
    
    req.body = value;
    next();
  };
};

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error('Error:', err);

  const response: ApiResponse = {
    success: false,
    error: err.message || 'Internal server error'
  };

  if (err.name === 'ValidationError') {
    response.error = 'Validation error';
    response.details = err.message;
    return res.status(400).json(response);
  }

  if (err.name === 'MongoError' || err.name === 'MongooseError') {
    response.error = 'Database error';
    return res.status(500).json(response);
  }

  res.status(500).json(response);
};

export const notFound = (req: Request, res: Response) => {
  const response: ApiResponse = {
    success: false,
    error: `Route ${req.originalUrl} not found`
  };
  res.status(404).json(response);
};
