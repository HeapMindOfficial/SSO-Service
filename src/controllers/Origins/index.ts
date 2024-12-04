import { Request, Response } from "express";
import { responseHandler } from "../../helpers/ResponseHandler";
import db from "../../Services/DB"
import { AppError } from "../../helpers/AppError";
import { allowedOrigins } from "../../app";

export const getOrigins = async (req: Request, res: Response) => {
    try {
        const origins = await db.allowedOrigin.findMany();
        responseHandler({
            status: 200,
            success: true,
            message: "Origins fetched successfully",
            data: origins
        }, req, res);
    } catch (error: any) {
        throw new AppError({
            message: error.message,
            statusCode: 500,
            reason: "Error while fetching origins"
        })

    }
}


export const addOrigin = async (req: Request, res: Response) => {
    try {
        const { origin } = req.body;
        const newOrigin = await db.allowedOrigin.create({
            data: {
                origin
            }
        });
        allowedOrigins.push(origin);
        responseHandler({
            status: 200,
            success: true,
            message: "Origin added successfully",
            data: newOrigin
        }, req, res);
    } catch (error: any) {
        throw new AppError({
            message: error.message,
            statusCode: 500,
            reason: "Error while adding origin"
        })
    }
}


export const deleteOrigin = async (req: Request, res: Response) => {
    try {
        const { id } = req.params as { id: string };
        const origin = await db.allowedOrigin.delete({
            where: {
                id: id
            }
        });
        const index = allowedOrigins.indexOf(origin.origin);
        if (index !== -1) allowedOrigins.splice(index, 1);
        responseHandler({
            status: 200,
            success: true,
            message: "Origin deleted successfully",
            data: origin
        }, req, res);
    } catch (error: any) {
        throw new AppError({
            message: error.message,
            statusCode: 500,
            reason: "Error while deleting origin"
        })
    }
}