import crypto from "crypto";
import db from "../../Services/DB";
export async function sessionTokens({
    userId,
}: {
    userId: string,
}): Promise<{
    token: string,
    expiresAt: Date
}> {
    const token = crypto.randomBytes(16).toString("hex");
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // Expires in 30 days

    const authToken = await db.sessions.create({
        data: {
            userId,
            token,
            expiresAt
        }
    });

    return {
        token: authToken.token,
        expiresAt: authToken.expiresAt,
    };

}