import { constants, createDecipheriv, privateDecrypt } from "crypto";
import { NextFunction, Request, Response } from "express";
import { AppError } from "../helpers/AppError";
import config from "../config";

const PRIVATE_KEY = config.DECRYPTION_PRIVATE_KEY;

function decryptAESKey(encryptedKey: string): Buffer {
    const buffer = Buffer.from(encryptedKey, 'base64');
    return privateDecrypt(
        {
            key: PRIVATE_KEY,
            padding: constants.RSA_PKCS1_OAEP_PADDING,
        },
        buffer
    );
}

// Decrypt data with AES-GCM
function decryptWithAES(aesKey: Buffer, encryptedData: string, iv: string): string {
    const decipher = createDecipheriv(
        'aes-256-gcm',
        aesKey,
        Buffer.from(iv, 'base64')
    );

    const encryptedBuffer = Buffer.from(encryptedData, 'base64');
    const tagLength = 16; // 128 bits

    const tag = encryptedBuffer.slice(-tagLength);
    const data = encryptedBuffer.slice(0, -tagLength);

    decipher.setAuthTag(tag);

    const decrypted = Buffer.concat([
        decipher.update(data),
        decipher.final()
    ]);

    return decrypted.toString('utf8');
}

// Main decryption function
function decryptJsonData(encryptedKey: string, encryptedData: string, iv: string): Record<string, any> {
    const aesKey = decryptAESKey(encryptedKey);
    const jsonString = decryptWithAES(aesKey, encryptedData, iv);
    return JSON.parse(jsonString);
}

// Middleware
export const decryptor = (req: Request, res: Response, next: NextFunction) => {
    if (req.body.encrypted) {
        const { encryptedKey, encryptedData, iv } = req.body.encrypted;
        req.body = decryptJsonData(encryptedKey, encryptedData, iv);
    }
    next();
};