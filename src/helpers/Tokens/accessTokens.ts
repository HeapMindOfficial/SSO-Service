import crypto from "crypto";
import db from "../../Services/DB";

/**
 * Generate an Access Token
 * @param code - The authorization code issued earlier
 */
export const generateAccessToken = async (code: string) => {
    // Validate the authorization code
    const authCode = await db.authorizationCode.findUnique({
        where: { code },
        include: { client: true, user: true },
    });

    if (!authCode) {
        throw new Error("Invalid authorization code");
    }

    // Check if the authorization code has expired
    if (authCode.expiresAt < new Date()) {
        throw new Error("Authorization code expired");
    }

    // Generate a secure access token
    const accessToken = crypto.randomBytes(128).toString("hex");

    // Generate a secure refresh token
    const refreshToken = crypto.randomBytes(128).toString("hex");

    // Save the tokens in the database
    const newAccessToken = await db.accessToken.create({
        data: {
            token: accessToken,
            clientId: authCode.clientId,
            userId: authCode.userId,
            scopes: authCode.scopes,
            sessionId: authCode.sessionId,
            expiresAt: new Date(Date.now() + 24* 60 * 60 * 1000), // Expires in 24 hour
        },
    });

    const newRefreshToken = await db.refreshToken.create({
        data: {
            token: refreshToken,
            clientId: authCode.clientId,
            userId: authCode.userId,
            sessionId: authCode.sessionId,
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Expires in 7 days
        },
    });

    // Revoke the authorization code
    await db.authorizationCode.delete({ where: { id: authCode.id } });

    return [accessToken, refreshToken];
};


export const generateNewAccessToken = async (refreshToken: string) => {
    // Validate the refresh token
    const token = await db.refreshToken.findUnique({
        where: { token: refreshToken },
        include: { client: true, user: true },
    });

    if (!token) {
        throw new Error("Invalid refresh token");
    }

    // Check if the refresh token has expired
    if (token.expiresAt < new Date()) {
        throw new Error("Refresh token expired");
    }

    const oldAccessToken = await db.accessToken.findFirst({
        where: {
            sessionId: token.sessionId,
        }
    })

    // Generate a secure access token
    const accessToken = crypto.randomBytes(128).toString("hex");

    // Save the access token in the database
    const newAccessToken = await db.accessToken.create({
        data: {
            token: accessToken,
            clientId: token.clientId,
            userId: token.userId,
            scopes: oldAccessToken?.scopes,
            sessionId: token.sessionId,
            expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // Expires in 24 hour
        },
    });

    return accessToken;
}