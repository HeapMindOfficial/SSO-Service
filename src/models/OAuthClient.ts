import { UUIDTypes } from "uuid";

export type GrantTypes = "authorization_code" | "refresh";
export type ScopeTypes = "openid" | "profile" | "email";

export interface OAuth2Client {
    clientId: UUIDTypes;
    clientSecret: string;
    name: string;
    redirectUris: string[];
    grantTypes: GrantTypes[];
    scopes: ScopeTypes[];

}