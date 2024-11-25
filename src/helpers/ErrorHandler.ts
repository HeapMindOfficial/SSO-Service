import { Request, Response, NextFunction, response } from 'express';
import consola from 'consola';
import { SERVER_ERROR } from '../constants/responses';
import { AppError } from './AppError';
import config from '../config';

export const errorHandler = (err: AppError, req: Request, res: Response, next: NextFunction) => {
    if (err.showStackTrace) {
        consola.error('Stack Trace:- ', err.stack); // Log the error stack trace for debugging
    }

    // Determine the status code based on the error type
    const statusCode = err.statusCode || 500;
    const reason = err.reason || SERVER_ERROR;
    const message = err.message || SERVER_ERROR;

    if (err.type === 'request/failed') {
        consola.fail({
            message: `Method: ${req.method}, URL: ${config.BACKEND_URL}${req.url}, IP: ${req.ip}, Status: ${statusCode}, Host: ${req.hostname}`,
            badge: false,
        });
    } else {
        consola.warn({
            message: `Method: ${req.method}, URL: ${config.BACKEND_URL}${req.url}, IP: ${req.ip}, Status: ${statusCode}, Host: ${req.hostname}`,
            badge: false,
        });
    }



    // Send the response
    res.status(200).json({
        status: statusCode,
        success: false,
        reason: reason,
        message: message,
        data: null,
    });
};
