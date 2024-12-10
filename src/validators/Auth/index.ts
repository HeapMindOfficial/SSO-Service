import { z } from "zod";

export const userRegistrationSchema = z.object({
    data: z.object({
        email: z.string().email({ message: "Invalid email address" }),
        password: z
            .string()
            .min(8, { message: "Password must be at least 8 characters long" })
            .max(100, { message: "Password must not exceed 100 characters" }),
        name: z.string().min(1, { message: "Name is required" }),
    }).required(),
    meta: z.object({
        responseType: z.string().min(1, { message: "Response type is required" }),
        clientId: z.string().min(1, { message: "Client ID is required" }),
        scopes: z.array(z.string(), { message: "At least one scope is required" }),
        redirectUri: z.string().url({ message: "Invalid redirect URI" }),
    }).required()
})

export const userLoginSchema = z.object({
    data: z.object({
        email: z.string().email({ message: "Invalid email address" }),
        password: z.string().min(8, { message: "Password must be at least 8 characters long" }),
    }).required(),
    meta: z.object({
        responseType: z.string().min(1, { message: "Response type is required" }),
        clientId: z.string().min(1, { message: "Client ID is required" }),
        scopes: z.array(z.string(), { message: "At least one scope is required" }),
        redirectUri: z.string().url({ message: "Invalid redirect URI" }),
    }).required()
});

export const oauth2ClientSchema = z.object({
    clientId: z.string().min(1, { message: "Client ID is required" }),
    clientSecret: z.string().min(1, { message: "Client secret is required" }),
    name: z.string().min(1, { message: "Client name is required" }),
    redirectUris: z
        .array(z.string().url({ message: "Invalid redirect URI" }))
        .nonempty({ message: "At least one redirect URI is required" }),
    grantTypes: z
        .array(z.string())
        .nonempty({ message: "At least one grant type is required" }),
    scopes: z
        .array(z.string())
        .nonempty({ message: "At least one scope is required" }),
});

export const oauth2ClientRegistrationSchema = z.object({
    name: z.string().min(1, { message: "Client name is required" }),
    redirectUris: z
        .array(z.string().url({ message: "Invalid redirect URI" }))
        .nonempty({ message: "At least one redirect URI is required" }),
    grantTypes: z
        .array(z.string())
        .nonempty({ message: "At least one grant type is required" }),
    scopes: z
        .array(z.string())
        .nonempty({ message: "At least one scope is required" }),
})

export const validateoauth2ClientSchema = z.object({
    meta: z.object({
        clientId: z.string().min(1, { message: "Client ID is required" }),
        responseType: z.string().min(1, { message: "Response type is required" }),
        redirectUri: z.string().url({ message: "Invalid redirect URI" }),
        scopes: z.array(z.string(), { message: "At least one scope is required" }),
    }).required()
});

export const validateAccessTokenGeneratorSchema = z.object({
    data: z.object({
        authorization_code: z.string().min(1, { message: "Authorization code is required" }),
    }).required(),
    meta: z.object({
        responseType: z.string().min(1, { message: "Response type is required" }),
        clientId: z.string().min(1, { message: "Client ID is required" }),
        redirectUri: z.string().url({ message: "Invalid redirect URI" }),
        scopes: z.array(z.string(), { message: "At least one scope is required" }),
        clientSecret: z.string()
    }).required()
});


export const authorizationCodeSchema = z.object({
    code: z.string().min(1, { message: "Authorization code is required" }),
    clientId: z.string().min(1, { message: "Client ID is required" }),
    userId: z.string().min(1, { message: "User ID is required" }),
    scopes: z.array(z.string()).optional(),
    redirectUri: z.string().url({ message: "Invalid redirect URI" }),
    expiresAt: z.date({ required_error: "Expiration date is required" }),
});


export const accessTokenSchema = z.object({
    token: z.string().min(1, { message: "Access token is required" }),
    clientId: z.string().min(1, { message: "Client ID is required" }),
    userId: z.string().optional(),
    scopes: z.array(z.string()).optional(),
    expiresAt: z.date({ required_error: "Expiration date is required" }),
});