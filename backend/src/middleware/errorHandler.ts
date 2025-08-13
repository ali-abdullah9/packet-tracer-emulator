import { Request, Response, NextFunction } from 'express';
import { Schema } from 'joi';
import { ApiResponse } from '../types';

export const validateRequest = (schema: Schema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
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
      res.status(400).json(response);
      return;
    }
    
    req.body = value;
    next();
  };
};

export const errorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  console.error('Error:', err);

  const response: ApiResponse = {
    success: false,
    error: err.message || 'Internal server error'
  };

  if (err.name === 'ValidationError') {
    response.error = 'Validation error';
    response.details = { message: err.message };
    res.status(400).json(response);
    return;
  }

  if (err.name === 'MongoError' || err.name === 'MongooseError') {
    response.error = 'Database error';
    res.status(500).json(response);
    return;
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
