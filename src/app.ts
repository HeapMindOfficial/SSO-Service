import express, { NextFunction, Request, Response } from "express";
import cors from "cors";
import path from "path";
import consola from "consola";
import cookieParser from "cookie-parser";
import "reflect-metadata";
import { responseHandler } from "./helpers/ResponseHandler";
import { startServer } from "./helpers/Server/StartServer";
import { errorHandler } from "./helpers/ErrorHandler";
import { AppError } from "./helpers/AppError";
import AuthRoutes from "./routes/Auth";
import OriginRoutes from "./routes/Origins";
import config from "./config";
import db from "./Services/DB";

//initializations
const app = express();
consola.wrapAll();

export let allowedOrigins: string[] = [];

// Function to initialize allowed origins
async function fetchAllowedOrigins(): Promise<void> {
    try {
        const origins = await db.allowedOrigin.findMany();
        allowedOrigins = origins.map((origin) => origin.origin);
        consola.success(`Allowed Origins: [${allowedOrigins.join(", ")}]`);
    } catch (error) {
        consola.error("Failed to fetch allowed origins:", error);
        process.exit(1); // Exit if origins can't be fetched
    }
}

// Middleware for dynamic CORS handling
app.use(
    cors({
        credentials: true,
        origin: (origin, callback) => {
            if (!origin || allowedOrigins.includes(origin)) {
                callback(null, true);
            } else {
                callback(new Error("Not allowed by CORS"));
            }
        },
    })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Static files access
app.use("/", express.static(path.join(__dirname, "../public")));

// Health check
app.get("/api/health", (req: Request, res: Response) => {
    responseHandler({ status: 200, success: true, message: "Server is running", data: null }, req, res);
});

// API Routes
app.use("/api/v1", AuthRoutes);
app.use("/api/v1/origins", OriginRoutes);

// Handle 404
app.use((req: Request, res: Response) => {
    throw new AppError({
        message: "Resource not found",
        statusCode: 404,
        reason: "NOT_FOUND",
        type: "request/error",
    });
});

// Error Handler
app.use(errorHandler);

// Start the server after fetching allowed origins
(async () => {
    await fetchAllowedOrigins();
    startServer(app);
})();
