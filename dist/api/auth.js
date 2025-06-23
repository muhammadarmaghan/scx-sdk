"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthApi = void 0;
const scx_1 = require("../scx");
const cross_fetch_1 = __importDefault(require("cross-fetch"));
class AuthApi {
    constructor(storage) {
        this.SESSION_KEY = "SCX_TOKEN";
        this.scxStorage = storage;
    }
    getSession() {
        return __awaiter(this, void 0, void 0, function* () {
            const tokenInfoString = this.scxStorage.getItem(this.SESSION_KEY);
            const authInfo = tokenInfoString && JSON.parse(tokenInfoString);
            if (!(authInfo === null || authInfo === void 0 ? void 0 : authInfo.access_token))
                return undefined;
            const currentTime = new Date().getTime(); // Get current time in milliseconds
            if (currentTime >= authInfo.expires_in) {
                if (currentTime >= authInfo.refresh_expires_in) {
                    this.logout();
                    return undefined;
                }
                else {
                    try {
                        const refreshAuthInfo = yield this.getRefreshToken(authInfo.refresh_token);
                        this.setSession(this.formatAuthInfo(refreshAuthInfo));
                        return refreshAuthInfo.access_token;
                    }
                    catch (error) {
                        // Handle the error when refreshing the token
                        console.error("Error refreshing token:", error);
                        return undefined;
                    }
                }
            }
            else {
                return authInfo.access_token;
            }
        });
    }
    getToken() {
        const tokenInfoString = this.scxStorage.getItem(this.SESSION_KEY);
        const authInfo = tokenInfoString && JSON.parse(tokenInfoString);
        return authInfo === null || authInfo === void 0 ? void 0 : authInfo.access_token;
    }
    setSession(authInfo) {
        authInfo.access_token && this.scxStorage.setItem(this.SESSION_KEY, JSON.stringify(authInfo));
    }
    login(username, password) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!username || !password)
                throw Error("User/password required");
            try {
                const credentials = 'Basic ' + btoa(username + ':' + password);
                const response = yield (0, cross_fetch_1.default)(`${scx_1.Scx.API_BASE}/auth/p/token-management/login`, {
                    method: 'POST',
                    headers: {
                        'Accept': 'application/json',
                        'Authorization': credentials,
                    },
                });
                const authInfo = yield response.json();
                this.setSession(this.formatAuthInfo(authInfo));
                return authInfo.access_token;
            }
            catch (error) {
                throw Error(error.message);
            }
        });
    }
    getRefreshToken(refreshToken) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!refreshToken)
                throw Error("Refresh token required");
            try {
                const authResponse = yield (0, cross_fetch_1.default)(`${scx_1.Scx.API_BASE}/auth/p/token-management/refresh?refresh-token=${refreshToken}`, {
                    method: 'POST',
                    headers: {
                        "Accept": 'application/json',
                    }
                });
                const authInfo = yield authResponse.json();
                return authInfo;
            }
            catch (error) {
                throw Error(error.message);
            }
        });
    }
    formatAuthInfo(authInfo) {
        if (!authInfo)
            throw Error("Invalid auth info");
        const expiresAt = new Date();
        expiresAt.setSeconds(expiresAt.getSeconds() + authInfo.expires_in);
        const refreshExpiresAt = new Date();
        refreshExpiresAt.setSeconds(refreshExpiresAt.getSeconds() + authInfo.refresh_expires_in);
        return Object.assign(Object.assign({}, authInfo), { expires_in: expiresAt.getTime(), refresh_expires_in: refreshExpiresAt.getTime() });
    }
    logout() {
        this.scxStorage.removeItem(this.SESSION_KEY);
        return true;
    }
    isLoggedIn() {
        return __awaiter(this, void 0, void 0, function* () {
            const sessionInfo = yield this.getSession();
            return !!sessionInfo;
        });
    }
    getUserId() {
        const tokenInfoString = this.scxStorage.getItem(this.SESSION_KEY);
        return tokenInfoString && JSON.parse(tokenInfoString).id;
    }
}
exports.AuthApi = AuthApi;
