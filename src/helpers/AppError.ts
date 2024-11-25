export class AppError extends Error {
    statusCode: number;
    reason: string;
    showStackTrace: boolean;
    type: string;

    constructor({
        message,
        statusCode,
        reason,
        stackTrace = false,
        type = 'request/failed',
    }: {
        message: string;
        statusCode: number;
        reason: string;
        stackTrace?: boolean;
        type?: "request/failed" | "request/error";
    }) {
        super(message);
        this.statusCode = statusCode;
        this.reason = reason;
        this.showStackTrace = stackTrace;
        this.type = type;
        Error.captureStackTrace(this, this.constructor);

    }
}
