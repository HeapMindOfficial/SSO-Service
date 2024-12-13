import { NextFunction, Request, Response } from "express";
import { AppError } from "../helpers/AppError";
import db from "../Services/DB";
import { OAuth2Client } from "@prisma/client";

export const verifyOAuthClient = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { clientId, responseType, scopes }:
            {
                clientId: string
                responseType: string,
                redirectUri: string,
                scopes: string[]
            } = req.body.meta;

        const redirectUri = req.body.meta.redirectUri.split('?')[0];
        const client = await db.oAuth2Client.findUnique({
            where: {
                clientId: clientId,
            },
        });


        if (!client) {
            const error = new AppError({
                message: "No OAuth Client Found",
                reason: "invalid-clientId",
                statusCode: 401,
                type: "request/failed",
                error: {
                    client_id: "Invalid Client Id. Client do not exist"
                }
            });
            return next(error);
        }


        if (!client?.redirectUris.includes(redirectUri)) {
            const error = new AppError({
                message: "redirect_uri mismatch",
                reason: "invalid-redirect_uri",
                statusCode: 409,
                type: "request/failed",
                error: {
                    redirect_uri: "Invalid redirect uri. Redirect_uri sent does not match with the redirect_uris the app was registered with!"
                }
            });
            return next(error);
        }

        //check if the scopes array has valid scopes by crosschecking with the oAuthClient.scopes array
        if (!scopes.every(value => client?.scopes.includes(value))) {
            const error = new AppError({
                message: "scopes mismatch",
                reason: "invalid-scopes",
                statusCode: 409,
                type: "request/failed",
                error: {
                    scopes: "Invalid scopes. Scopes sent does not match with the scopes the app was registered with!"
                }
            });
            return next(error);
        }

        if (!client?.grantTypes.includes(responseType)) {
            const error = new AppError({
                message: "response_type mismatch",
                reason: "invalid-response_type",
                statusCode: 409,
                type: "request/failed",
                error: {
                    response_type: "Invalid response_type. response_type sent does not match with the response_type the app was registered with!"
                }
            });
            return next(error);
        }
        if (req.body.meta.clientSecret) {
            return verifyOAuthClientSecret(client, req, res, next);
        }
        return next();
    } catch (error) {
        console.log(error);
        return next(new AppError({
            message: "Internal server error",
            statusCode: 500,
            reason: "INTERNAL_SERVER_ERROR",
            type: "request/error",
        }));
    }
}

const verifyOAuthClientSecret = async (client: OAuth2Client, req: Request, res: Response, next: NextFunction) => {
    try {
        const { clientSecret } = req.body.meta;
        if (client.clientSecret !== clientSecret) {
            const error = new AppError({
                message: "Invalid client secret",
                reason: "invalid-client-secret",
                statusCode: 401,
                type: "request/failed",
                error: {
                    client_secret: "Invalid client secret. Client secret do not match"
                }
            });
            return next(error);
        }
        next();
    } catch (error) {
        return next(new AppError({
            message: "Internal server error",
            statusCode: 500,
            reason: "INTERNAL_SERVER_ERROR",
            type: "request/error",
        }));
    }

}