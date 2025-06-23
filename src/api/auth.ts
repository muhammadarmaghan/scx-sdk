import { Scx } from "../scx";
import { AuthResponse } from "../types";
import {StorageAdapter} from "../utils/storage";
import fetch from "cross-fetch";

export class AuthApi {
    private SESSION_KEY = "SCX_TOKEN";
    scxStorage: StorageAdapter;

    constructor(storage: StorageAdapter) {
        this.scxStorage = storage;
    }

    async getSession() {
        const tokenInfoString = this.scxStorage.getItem(this.SESSION_KEY)
        const authInfo: AuthResponse = tokenInfoString && JSON.parse(tokenInfoString);
        if (!authInfo?.access_token) return undefined;

        const currentTime = new Date().getTime(); // Get current time in milliseconds

        if (currentTime >= authInfo.expires_in) {
            if (currentTime >= authInfo.refresh_expires_in) {
                this.logout()
                return undefined;
            } else {
                try {
                    const refreshAuthInfo = await this.getRefreshToken(authInfo.refresh_token);
                    this.setSession(this.formatAuthInfo(refreshAuthInfo));
                    return refreshAuthInfo.access_token;
                } catch (error) {
                    // Handle the error when refreshing the token
                    console.error("Error refreshing token:", error);
                    return undefined;
                }
            }
        } else {
            return authInfo.access_token;
        }
    }

    getToken(){
        const tokenInfoString = this.scxStorage.getItem(this.SESSION_KEY)
        const authInfo: AuthResponse = tokenInfoString && JSON.parse(tokenInfoString);
        return authInfo?.access_token;
    }

    setSession(authInfo: AuthResponse) {
        authInfo.access_token && this.scxStorage.setItem(this.SESSION_KEY, JSON.stringify(authInfo));
    }

    async login(username: string, password: string) {
        if (!username || !password) throw Error("User/password required");
        try {
            const credentials = 'Basic ' + btoa(username + ':' + password);
            const response = await fetch(`${Scx.API_BASE}/auth/p/token-management/login`, {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Authorization': credentials,
                },
            });
            const authInfo: AuthResponse = await response.json();
            this.setSession(this.formatAuthInfo(authInfo));
            return authInfo.access_token;
        } catch (error: any) {
            throw Error(error.message);
        }
    }


    async getRefreshToken(refreshToken: string) {
        if (!refreshToken) throw Error("Refresh token required");
        try {
            const authResponse: Response = await fetch(`${Scx.API_BASE}/auth/p/token-management/refresh?refresh-token=${refreshToken}`, {
                method: 'POST',
                headers: {
                    "Accept": 'application/json',
                }
            })
            const authInfo: AuthResponse = await authResponse.json();
            return authInfo;
        } catch (error: any) {
            throw Error(error.message);
        }
    }

    formatAuthInfo(authInfo: AuthResponse) {
        if (!authInfo) throw Error("Invalid auth info");
        const expiresAt = new Date();
        expiresAt.setSeconds(expiresAt.getSeconds() + authInfo.expires_in);

        const refreshExpiresAt = new Date();
        refreshExpiresAt.setSeconds(
            refreshExpiresAt.getSeconds() + authInfo.refresh_expires_in
        );

        return {
            ...authInfo,
            expires_in: expiresAt.getTime(), // Use getTime() to get the timestamp in milliseconds
            refresh_expires_in: refreshExpiresAt.getTime(), // Use getTime() to get the timestamp in milliseconds
        }
    }

    logout() {
        this.scxStorage.removeItem(this.SESSION_KEY);
        return true;
    }

    async isLoggedIn(): Promise<boolean> {
        const sessionInfo = await this.getSession()
        return !!sessionInfo;
    }

    getUserId(): Promise<string> {
        const tokenInfoString = this.scxStorage.getItem(this.SESSION_KEY)
        return tokenInfoString && JSON.parse(tokenInfoString).id;
    }
}
