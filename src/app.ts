import express, { NextFunction, Request, Response } from "express";
import cors from "cors";
import path from "path";
import consola from 'consola';
import cookieParser from 'cookie-parser';
import 'reflect-metadata';
import { responseHandler } from "./helpers/ResponseHandler";
import { startServer } from "./helpers/Server/StartServer";
import { errorHandler } from "./helpers/ErrorHandler";
import { AppError } from "./helpers/AppError";
//initializations
const app = express();
consola.wrapAll();

//configurations and middlewares
app.use(
    cors({
        credentials: true,
        origin: [""],
    }),
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(cookieParser());
//ROUTES START HERE
//static files access
app.use("/", express.static(path.join(__dirname, "../public")));

//health check
app.get('/api/health', (req: Request, res: Response) => {
    responseHandler({ status: 200, success: true, message: 'Server is running', data: null }, req, res);
});

app.use((req: Request, res: Response) => {
    throw new AppError({
        message: 'Resource not found',
        statusCode: 500,
        reason: 'NOT_FOUND',
        type: "request/error"
    });
});

app.use(errorHandler);


startServer(app);