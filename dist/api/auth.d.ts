import { AuthResponse } from "../types";
import { StorageAdapter } from "../utils/storage";
export declare class AuthApi {
    private SESSION_KEY;
    scxStorage: StorageAdapter;
    constructor(storage: StorageAdapter);
    getSession(): Promise<string | undefined>;
    getToken(): string;
    setSession(authInfo: AuthResponse): void;
    login(username: string, password: string): Promise<string>;
    getRefreshToken(refreshToken: string): Promise<AuthResponse>;
    formatAuthInfo(authInfo: AuthResponse): {
        expires_in: number;
        refresh_expires_in: number;
        refresh_token: string;
        token_type: string;
        session_state: string;
        access_token: string;
        before: string | null;
        scope: string;
    };
    logout(): boolean;
    isLoggedIn(): Promise<boolean>;
    getUserId(): Promise<string>;
}
//# sourceMappingURL=auth.d.ts.map