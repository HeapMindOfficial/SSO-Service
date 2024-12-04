import { NextFunction, Request, Response } from 'express';
import { ZodError, ZodSchema } from 'zod';
import { AppError } from '../helpers/AppError';

export const validate =
    (schema: ZodSchema) =>
        (req: Request, res: Response, next: NextFunction) => {
            try {
                // Validate the request body
                schema.parse(req.body);
                next(); // Proceed if validation is successful
            } catch (error: any) {
                if (error instanceof ZodError) {
                    const formattedErrors = error.errors.map((err) => ({
                        path: err.path.join('.'), // Join path segments for nested properties
                        message: err.message,
                    }));
                    next(new AppError({
                        message: 'Invalid request data',
                        statusCode: 400,
                        reason: "Validation failed",
                        type: 'request/error',
                        error: formattedErrors,
                    }))
                }
                next(new AppError({
                    message: 'Invalid request data',
                    statusCode: 400,
                    reason: 'Invalid request data',
                    type: 'request/error',
                }))
            }
        };
