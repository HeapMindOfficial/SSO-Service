import crypto from "crypto";
import { GrantTypes, OAuth2Client, ScopeTypes } from "../models/OAuthClient";

export class OAuthBuilder {
    private OAuthClient: Partial<OAuth2Client> = {};
    constructor() {
        this.OAuthClient.clientId = this.createClientId();
        this.OAuthClient.clientSecret = this.createClientSecret();
    }

    private createClientId() {
        return crypto.randomUUID();
    }

    private createClientSecret() {
        return crypto.randomBytes(32).toString("hex");
    }

    clientName(name: string) {
        this.OAuthClient.name = name;
        return this;
    }

    redirectUris(uris: string[]) {
        this.OAuthClient.redirectUris = uris;
        return this;
    }

    grantTypes(types: GrantTypes[]) {
        this.OAuthClient.grantTypes = types;
        return this;
    }

    scopes(scopes: ScopeTypes[]) {
        this.OAuthClient.scopes = scopes;
        return this;
    }

    build() {
        return this.OAuthClient as OAuth2Client;
    }
}