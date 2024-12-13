import { NextFunction, Request, Response } from "express";
import { AppError } from "../../helpers/AppError";
import db from "../../Services/DB";
import { responseHandler } from "../../helpers/ResponseHandler";
import bcrypt from "bcrypt";
import { OAuthBuilder } from "../../Services/OAuthBuilder";
import { GrantTypes, ScopeTypes } from "../../models/OAuthClient";
import { OAuth2Client } from "@prisma/client";
import { authTokens } from "../../helpers/Tokens/authTokens";
import { generateAccessToken, generateNewAccessToken } from "../../helpers/Tokens/accessTokens";
import { sessionTokens } from "../../helpers/Tokens/sessionToken";

export const register = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { email, password, name } = req.body.data;
        const existingUser = await db.user.findUnique({
            where: {
                email,
            },
        })

        if (existingUser) {
            return next(new AppError({
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
        return;

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
        const { clientId, redirectUri, scopes }: {
            clientId: string,
            redirectUri: string,
            scopes: string[]
        } = req.body.meta;


        const { email, password } = req.body.data;
        const user = await db.user.findUnique({
            where: {
                email,
            },
        });

        if (!user) {
            return next(new AppError({
                message: "User not found",
                statusCode: 404,
                reason: "NOT_FOUND",
                type: "request/error",
            }));
        }

        if (user.deleted || user.disabled) {
            return next(new AppError({
                message: "User account is disabled/deleted. Contact the administrator",
                statusCode: 403,
                reason: "FORBIDDEN",
                type: "request/error",
            }));
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            return next(new AppError({
                message: "Invalid password",
                statusCode: 401,
                reason: "UNAUTHORIZED",
                type: "request/error",
            }));
        }

        let token: Partial<{ token: string, expiresAt: Date }> = {};

        try {
            token = await sessionTokens({ userId: user.id })
        } catch (error) {
            console.log(error);
            return next(new AppError({
                message: "Error generating Auth Token",
                statusCode: 500,
                reason: "INTERNAL_SERVER_ERROR",
                type: "request/error",
            }));
        }

        return responseHandler({
            status: 200,
            success: true,
            message: "User logged in successfully",
            data: {
                ...token,
            }
        }, req, res);

    } catch (error) {
        return next(new AppError({
            message: "Internal server error",
            statusCode: 500,
            reason: "INTERNAL_SERVER_ERROR",
            type: "request/error",
        }));
    }
}

export const generateAuthorizationCode = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { responseType, clientId, redirectUri, scopes }: {
            responseType: string,
            clientId: string,
            redirectUri: string,
            scopes: string[]
        } = req.body.meta;

        const { sessionId } = req.params;

        const session = await db.sessions.findFirst({
            where: {
                token: sessionId,
            }
        });

        if (!session) {
            return next(new AppError({
                message: "Session not found",
                statusCode: 404,
                reason: "NOT_FOUND",
                type: "request/error",
            }));
        }

        let token: Partial<string> = "";

        try {
            token = await authTokens({
                clientId,
                userId: session.userId,
                scopes,
                redirectUri,
                sessionId: session.id,
            })
        } catch (error) {
            console.log(error);
            return next(new AppError({
                message: "Error generating Auth Token",
                statusCode: 500,
                reason: "INTERNAL_SERVER_ERROR",
                type: "request/error",
            }));
        }

        return responseHandler({
            status: 200,
            success: true,
            message: "Authorization code generated successfully",
            data: {
                authorization_code: token,
            }
        }, req, res);

    } catch (error) {
        return next(new AppError({
            message: "Internal server error",
            statusCode: 500,
            reason: "INTERNAL_SERVER_ERROR",
            type: "request/error",
        }));

    }
}

export const generateToken = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { responseType, clientId, redirectUri, scopes }: {
            responseType: string,
            clientId: string,
            redirectUri: string,
            scopes: string[]
        } = req.body.meta;

        const { authorization_code } = req.body.data;

        if (responseType !== "authorization_code") {
            return next(new AppError({
                message: "Invalid response type",
                statusCode: 400,
                reason: "BAD_REQUEST",
                type: "request/error",
            }));
        }

        if (!authorization_code) {
            return next(new AppError({
                message: "Authorization code is required",
                statusCode: 400,
                reason: "BAD_REQUEST",
                type: "request/error",
            }));
        }

        const [accessToken, refreshToken] = await generateAccessToken(authorization_code);

        return responseHandler({
            status: 200,
            success: true,
            message: "Token generated successfully",
            data: {
                accessToken,
                refreshToken,
            }
        }, req, res);

    } catch (error: Error | any) {
        return next(new AppError({
            message: error?.message || "Internal server error",
            statusCode: 500,
            reason: "INTERNAL_SERVER_ERROR",
            type: "request/error",
        }));

    }
}

export const regenerateToken = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { responseType, clientId, redirectUri, scopes }: {
            responseType: string,
            clientId: string,
            redirectUri: string,
            scopes: string[]
        } = req.body.meta;

        const { refreshToken } = req.body.data;

        if (responseType !== "refresh") {
            return next(new AppError({
                message: "Invalid response type",
                statusCode: 400,
                reason: "BAD_REQUEST",
                type: "request/error",
            }));
        }

        if (!refreshToken) {
            return next(new AppError({
                message: "Authorization code is required",
                statusCode: 400,
                reason: "BAD_REQUEST",
                type: "request/error",
            }));
        }

        const accessToken = await generateNewAccessToken(refreshToken);
        return responseHandler({
            status: 200,
            success: true,
            message: "Token generated successfully",
            data: {
                accessToken,
                refreshToken,
            }
        }, req, res);

    } catch (error: Error | any) {
        return next(new AppError({
            message: error?.message || "Internal server error",
            statusCode: 500,
            reason: "INTERNAL_SERVER_ERROR",
            type: "request/error",
        }));
    }
}

export const registerClient = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { name, redirectUris, grantTypes, scopes }: {
            name: string,
            redirectUris: string[],
            grantTypes: GrantTypes[],
            scopes: ScopeTypes[]
        } = req.body;
        const OAuth = new OAuthBuilder();
        const OAuthClient = OAuth.clientName(name).redirectUris(redirectUris).grantTypes(grantTypes).scopes(scopes).build() as OAuth2Client;

        const client = await db.oAuth2Client.create({
            data: OAuthClient,
        });

        return responseHandler({
            status: 201,
            success: true,
            message: "Client registered successfully",
            data: client,
        }, req, res);

    } catch (error) {
        return next(new AppError({
            message: "Internal server error",
            statusCode: 500,
            reason: "INTERNAL_SERVER_ERROR",
            type: "request/error",
        }));
    }
}

export const validateClient = async (req: Request, res: Response, next: NextFunction) => {
    try {
        return responseHandler({
            status: 200,
            success: true,
            message: "Client validated successfully",
            data: null,
        }, req, res);
    } catch (error: any) {
        console.log(error);
        return next(new AppError({
            message: "Internal server error",
            statusCode: 500,
            reason: "INTERNAL_SERVER_ERROR",
            type: "request/error",
        }));
    }
}