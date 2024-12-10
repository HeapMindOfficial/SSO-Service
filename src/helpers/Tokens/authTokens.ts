import crypto from "crypto";
import db from "../../Services/DB";
export async function authTokens({
    clientId,
    userId,
    scopes,
    redirectUri,
    sessionId
}: {
    clientId: string,
    userId: string,
    scopes: string[],
    redirectUri: string,
    sessionId: string
}): Promise<string> {
    const authorizationCode = crypto.randomBytes(32).toString("hex");

    const authToken = await db.authorizationCode.create({
        data: {
            clientId,
            userId,
            scopes,
            code: authorizationCode,
            redirectUri,
            sessionId,
            expiresAt: new Date(Date.now() + 5 * 60 * 1000),
        }
    });

    return authorizationCode;

}