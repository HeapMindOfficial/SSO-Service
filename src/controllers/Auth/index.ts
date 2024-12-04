import { NextFunction, Request, Response } from "express";
import { AppError } from "../../helpers/AppError";
import db from "../../Services/DB";
import { responseHandler } from "../../helpers/ResponseHandler";
import bcrypt from "bcrypt";
import { OAuthBuilder } from "../../Services/OAuthBuilder";
import { GrantTypes, ScopeTypes } from "../../models/OAuthClient";
import { OAuth2Client } from "@prisma/client";

export const register = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { email, password, name } = req.body;
        const existingUser = await db.user.findUnique({
            where: {
                email,
            },
        })

        if (existingUser) {
            next(new AppError({
                message: "User already exists",
                statusCode: 400,
                reason: "BAD_REQUEST",
                type: "request/error",
            }));
        }

        const hashedPassword = await bcrypt.hash(password, 10);


        const user = await db.user.create({
            data: {
                email,
                password: hashedPassword,
                name,
            },
        });

        responseHandler({
            status: 201,
            success: true,
            message: "User registered successfully",
            data: user,
        }, req, res);

    } catch (error: any) {
        next(new AppError({
            message: "Internal server error",
            statusCode: 500,
            reason: "INTERNAL_SERVER_ERROR",
            type: "request/error",
        }));
    }
};

export const login = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { response_type, client_id, redirect_uri, scope } = req.query;
        const { email, password } = req.body;
        const user = await db.user.findUnique({
            where: {
                email,
            },
        });

        if (!user) {
            next(new AppError({
                message: "User not found",
                statusCode: 404,
                reason: "NOT_FOUND",
                type: "request/error",
            }));
        }



    } catch (error) {
        next(new AppError({
            message: "Internal server error",
            statusCode: 500,
            reason: "INTERNAL_SERVER_ERROR",
            type: "request/error",
        }));
    }
}

export const validate = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { response_type, client_id, redirect_uri, scope } = req.query;
        //possible values of response_type are code, refresh_token
    } catch (error) {

    }
}

export const registerClient = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { client_name: name, redirect_uri, grantTypes, scopes }: {
            client_name: string,
            redirect_uri: string[],
            grantTypes: GrantTypes[],
            scopes: ScopeTypes[]
        } = req.body;
        const OAuth = new OAuthBuilder();
        const OAuthClient = OAuth.clientName(name).redirectUris(redirect_uri).grantTypes(grantTypes).scopes(scopes).build() as OAuth2Client;

        const client = await db.oAuth2Client.create({
            data: OAuthClient,
        });

        responseHandler({
            status: 201,
            success: true,
            message: "Client registered successfully",
            data: client,
        }, req, res);

    } catch (error) {
        next(new AppError({
            message: "Internal server error",
            statusCode: 500,
            reason: "INTERNAL_SERVER_ERROR",
            type: "request/error",
        }));
    }
}