import consola from 'consola';
import { Request, Response } from 'express';
import config from '../config';

interface ApiResponse {
    status: number;
    success: boolean;
    message: string;
    data: any | null;
}

export const responseHandler = (data: ApiResponse, req: Request, res: Response) => {
    res.status(200).json(data);
    consola.success({
        message: `Method: ${req.method}, URL: ${config.BACKEND_URL}${req.url}, IP: ${req.ip}, Status: ${data.status}, Host: ${req.hostname}`,
        // badge: true,
    });
    return;
};
